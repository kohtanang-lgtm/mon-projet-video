import json, re, sys, difflib, unicodedata
asr=json.load(open(sys.argv[1])); script=open(sys.argv[2]).read().split()
cut=json.load(open(sys.argv[3])); out=sys.argv[4]
aw=[w for s in asr for w in s['words']]
def norm(t):
    t=unicodedata.normalize('NFD',t.lower()); t=''.join(c for c in t if unicodedata.category(c)!='Mn')
    return re.sub(r"[^a-z0-9]","",t)
A=[norm(w['text']) for w in aw]; S=[norm(w) for w in script]
sm=difflib.SequenceMatcher(None,S,A,autojunk=False)
times=[None]*len(S)
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag=='equal':
        for k in range(i2-i1): times[i1+k]=aw[j1+k]['start']
    elif tag=='replace' and (i2-i1)==(j2-j1):
        for k in range(i2-i1): times[i1+k]=aw[j1+k]['start']
    elif tag=='replace':
        # spread script words over the asr span
        t0=aw[j1]['start']; t1=aw[j2]['start'] if j2<len(aw) else aw[j2-1]['end']
        L=[max(1,len(S[i])) for i in range(i1,i2)]; tot=sum(L); acc=0
        for k,i in enumerate(range(i1,i2)): times[i]=t0+(t1-t0)*acc/tot; acc+=L[k]
# interpolate missing (inserts) by char length between anchors
i=0
while i<len(S):
    if times[i] is None:
        j=i
        while j<len(S) and times[j] is None: j+=1
        t0=times[i-1] if i>0 else 0.0; t1=times[j] if j<len(S) else cut[-1]['out_end']
        prevlen=max(1,len(S[i-1])) if i>0 else 0
        L=[max(1,len(S[k])) for k in range(i,j)]; tot=sum(L)+prevlen; acc=prevlen
        for k in range(i,j): times[k]=t0+(t1-t0)*acc/tot; acc+=max(1,len(S[k]))
        i=j
    else: i+=1
times=[max(0.0,t) for t in times]
# word ends: next start, but clamp at segment-joint/pauses (max 0.7s)
words=[]
for k,w in enumerate(script):
    st=times[k]; en=times[k+1] if k+1<len(script) else cut[-1]['out_end']
    en=min(en, st+0.75)
    words.append({"text":w,"start":round(st,3),"end":round(en,3)})
json.dump(words,open(out,'w'),ensure_ascii=False,indent=0)
for w in words: print(f"{w['start']:6.2f} {w['text']}", end=" | ")
