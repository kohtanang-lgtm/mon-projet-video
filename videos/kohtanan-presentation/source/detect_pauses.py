import sys, wave, json, numpy as np
w=wave.open(sys.argv[1]); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
hop=int(sr*0.01); n=len(x)//hop
r=20*np.log10(np.sqrt((x[:n*hop].reshape(n,hop)**2).mean(1))+1e-9)
# smooth 50ms
k=5; rs=np.convolve(r,np.ones(k)/k,mode='same')
ranges=json.loads(sys.argv[2]); out=[]
for a,b in ranges:
    i0,i1=int(a*100),int(b*100); seg=rs[i0:i1]
    floor=np.percentile(seg,10); peak=np.percentile(seg,95); thr=floor+0.30*(peak-floor)
    act=seg>thr
    # find inactive runs >= min_gap
    keep=[]; i=0; L=len(act)
    # regions of activity with hangover
    st=None
    for j in range(L):
        if act[j] and st is None: st=j
        if not act[j] and st is not None:
            keep.append([st,j]); st=None
    if st is not None: keep.append([st,L])
    # merge gaps < 0.20s
    merged=[]
    for s,e in keep:
        if merged and s-merged[-1][1] < 28: merged[-1][1]=e
        else: merged.append([s,e])
    # drop tiny blips < 60ms
    merged=[m for m in merged if m[1]-m[0]>=6]
    pre,post=0.07,0.12
    segs=[(max(a,a+s/100-pre), min(b,a+e/100+post)) for s,e in merged]
    # merge overlaps after padding
    fin=[]
    for s,e in segs:
        if fin and s<=fin[-1][1]+0.02: fin[-1]=(fin[-1][0],e)
        else: fin.append((s,e))
    print(f"range {a}-{b} thr={thr:.1f} floor={floor:.1f} peak={peak:.1f}")
    for s,e in fin: print(f"   {s:7.2f}-{e:7.2f} ({e-s:.2f})")
    out+=fin
tot=sum(e-s for s,e in out); print("total",round(tot,2),"segments",len(out))
json.dump([[round(s,3),round(e,3)] for s,e in out],open(sys.argv[3],"w"))
