import json, subprocess, sys
IN, keepf, outv, outa, sp, mapf = sys.argv[1:7]
keep=json.load(open(keepf))
fps=30
# quantize segment boundaries to frames so audio & video stay locked
q=lambda t: round(t*fps)/fps
segs=[(q(a),q(b)) for a,b in keep]
vf=[]; af=[]
for i,(a,b) in enumerate(segs):
    vf.append(f"[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS[v{i}]")
    d=b-a
    af.append(f"[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={max(0,d-0.015):.3f}:d=0.015[a{i}]")
n=len(segs)
fc=";".join(vf+af)+";"+"".join(f"[v{i}]" for i in range(n))+f"concat=n={n}:v=1:a=0[vc];"+"".join(f"[a{i}]" for i in range(n))+f"concat=n={n}:v=0:a=1[ac]"
fc+=";[vc]fps=30,scale=1080:1936:flags=lanczos,crop=1080:1920:0:8,unsharp=5:5:0.55:5:5:0.0,format=yuv420p[vo]"
model=f"{sp}/models/sh.rnnn"
fc+=(f";[ac]aresample=48000,highpass=f=90,lowpass=f=13000,arnndn=m={model}:mix=0.55,afftdn=nr=8:nf=-42,"
     "equalizer=f=220:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.0:g=3,equalizer=f=9000:t=h:w=1:g=1.5,deesser=i=0.3,"
     "acompressor=threshold=-26dB:ratio=3:attack=6:release=110:makeup=5dB,speechnorm=e=6:r=0.0001:l=1,"
     "loudnorm=I=-15:TP=-1.5:LRA=7[ao]")
cmd=["ffmpeg","-v","error","-y","-i",IN,"-filter_complex",fc,"-map","[vo]","-c:v","libx264","-preset","slow","-crf","16","-g","15","-keyint_min","15","-movflags","+faststart","-an",outv,
     "-map","[ao]","-ar","48000","-c:a","pcm_s16le",outa]
subprocess.run(cmd,check=True)
# map: output timeline
t=0; m=[]
for a,b in segs:
    m.append({"src_start":a,"src_end":b,"out_start":round(t,4),"out_end":round(t+b-a,4)}); t+=b-a
json.dump(m,open(mapf,"w"),indent=1); print("duration",round(t,3),"segments",n)
