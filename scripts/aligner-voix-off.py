import sys, re, subprocess, json, math
src = sys.argv[1]
out = subprocess.run(['ffmpeg','-hide_banner','-i',src,'-af','silencedetect=noise=-38dB:d=0.22','-f','null','-'],capture_output=True,text=True).stderr
starts=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]
ends=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',src],capture_output=True,text=True).stdout)
segs=[]; t=0.0
for s,e in zip(starts,ends):
    if s-t>0.08: segs.append([t,s])
    t=e
if dur-t>0.08: segs.append([t,dur])
# leading silence
segs=[[a,b] for a,b in segs if b-a>0.1]
units=[("Quand on envoie de l'argent…",7),("on envoie bien plus.",5),("Avez-vous pensé à ces 3 points ?",9),
("Ahmat,",2),("lui,",1),("y pense.",2),("À chaque envoi pour sa maman,",8),("à Abéché.",4),
("Un :",1),("il vérifie le nom et le numéro du bénéficiaire.",16),("Car un seul chiffre de travers…",8),("et tout peut se bloquer.",6),
("Vérifié.",3),("Validé.",3),("L'esprit tranquille.",4),
("Deux :",1),("il pose ses questions.",5),("Frais ?",1),("Délais ?",2),("Pièce d'identité ?",5),("Lieu de retrait ?",4),
("Un agent Tahwiil lui répond.",8),("En agence ou sur WhatsApp,",7),("jour et nuit,",3),("7 jours sur 7.",4),
("Trois :",1),("il garde précieusement son reçu…",9),("jusqu'au retrait.",4),("Et si un inconnu lui réclame son code PIN ?",12),
("JAMAIS.",2),("Un code PIN,",3),("ça ne se partage pas.",6),
("À Abéché,",4),("maman reçoit son argent.",7),("Un transfert…",3),("un sourire.",3),
("Tahwiil.",2),("Simple.",2),("Rapide.",2),("Sécurisé.",4),("Envoyez,",3),("payez,",2),("retirez…",3),("depuis votre téléphone.",7),
("Un service agréé,",6),("toujours à vos côtés.",6),("Faites comme Ahmat :",5),("téléchargez Tahwiil !",6)]
S=sum(u[1] for u in units); speech=sum(b-a for a,b in segs)
rate=S/speech
print(f'segments={len(segs)} units={len(units)} parole={speech:.2f}s debit={rate:.2f} syl/s')
n,m=len(segs),len(units)
INF=1e18
# dp[i][j]: best cost aligning first i segs with first j units
dp=[[INF]*(m+1) for _ in range(n+1)]; bk=[[None]*(m+1) for _ in range(n+1)]
dp[0][0]=0
for i in range(1,n+1):
    d=segs[i-1][1]-segs[i-1][0]
    for j in range(1,m+1):
        best=INF;arg=None
        syl=0
        for k in range(j-1,max(-1,j-7),-1):
            syl+=units[k][1]
            if dp[i-1][k]>=INF: continue
            exp=syl/rate+0.12*(j-k-1)
            c=dp[i-1][k]+math.log((d+0.05)/(exp+0.05))**2+0.15*(j-k-1)
            if c<best: best=c;arg=k
        dp[i][j]=best;bk[i][j]=arg
i,j=n,m;res=[]
while i>0:
    k=bk[i][j];res.append((segs[i-1],units[k:j]));i-=1;j=k
res.reverse()
print('cout',round(dp[n][m],3))
align=[]
for (a,b),us in res:
    syl=sum(u[1] for u in us)
    print(f'{a:6.2f}-{b:6.2f} ({b-a:4.2f}s, {syl/(b-a):4.1f} syl/s) | '+' '.join(u[0] for u in us))
    align.append({'de':round(a,3),'a':round(b,3),'texte':' '.join(u[0] for u in us),'unites':[u[0] for u in us]})
json.dump({'duree':dur,'segments':align},open(sys.argv[2],'w'),ensure_ascii=False,indent=1)
