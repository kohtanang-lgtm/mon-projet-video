import sys, wave, json, numpy as np, sherpa_onnx
wav, mdir, vadp, out = sys.argv[1:5]
w=wave.open(wav); sr=w.getframerate()
x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
cfg=sherpa_onnx.VadModelConfig(); cfg.silero_vad.model=vadp; cfg.silero_vad.min_silence_duration=0.25
cfg.silero_vad.min_speech_duration=0.15; cfg.silero_vad.threshold=0.35; cfg.silero_vad.max_speech_duration=20; cfg.sample_rate=sr
vad=sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=200)
ws=cfg.silero_vad.window_size; segs=[]
def drain():
    while not vad.empty():
        s=vad.front; segs.append((s.start/sr, np.array(s.samples))); vad.pop()
for i in range(0,len(x),ws):
    vad.accept_waveform(x[i:i+ws]); drain()
vad.flush(); drain()
rec=sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{mdir}/encoder.int8.onnx",decoder=f"{mdir}/decoder.int8.onnx",joiner=f"{mdir}/joiner.int8.onnx",tokens=f"{mdir}/tokens.txt",model_type="nemo_transducer",num_threads=4)
res=[]
for st,smp in segs:
    pad=np.zeros(int(0.3*sr),dtype=np.float32)
    s=rec.create_stream(); s.accept_waveform(sr,np.concatenate([pad,smp,pad])); rec.decode_stream(s); r=s.result
    toks=list(r.tokens); ts=[st+t-0.3 for t in r.timestamps]
    # merge tokens into words (SentencePiece '▁' or leading space marks word start)
    words=[]
    for tk,t in zip(toks,ts):
        if tk.startswith(' ') or tk.startswith('▁') or not words:
            words.append({"text":tk.strip().lstrip('▁'),"start":round(t,3)})
        else:
            words[-1]["text"]+=tk
    for i,wd in enumerate(words):
        wd["end"]=round(words[i+1]["start"] if i+1<len(words) else st+len(smp)/sr,3)
    d={"start":round(st,3),"end":round(st+len(smp)/sr,3),"text":r.text.strip(),"words":words}
    res.append(d); print(f'{d["start"]:7.2f}-{d["end"]:7.2f} {d["text"]}', flush=True)
json.dump(res,open(out,"w"),ensure_ascii=False,indent=1)
