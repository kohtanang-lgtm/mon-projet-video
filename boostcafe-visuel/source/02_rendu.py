import sys, time
import os
from commun import *
HERE=os.path.dirname(os.path.abspath(__file__))
REF=os.path.join(HERE,'..','references')
OUT=os.path.join(HERE,'..')
T0=time.time()
def log(s): print(s,'%.1fs'%(time.time()-T0),flush=True)
CX,CY,K,YF=880,600,1.4,1440
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
def blob(cx,cy,rx,ry): return np.exp(-(((xx-cx)/rx)**2+((yy-cy)/ry)**2))
BGR=lambda r,g,b: np.array([b,g,r],np.float32)
R=np.random.default_rng(42)

# ================= background =================
S=1.25; OY=60
src=cv2.imread(os.path.join(REF,'boostcafe-espace.jpg'))
big=cv2.resize(src,None,fx=S,fy=S,interpolation=cv2.INTER_CUBIC)[OY:OY+H,0:W]
L=lin(big)
Lb=disk_blur(L,7)
lum=Lb.mean(axis=2,keepdims=True)
Lb=Lb/(1+lum*2.0)
light=0.03+0.20*blob(CX,1080,700,380)+0.26*blob(1328,650,150,230)+0.05*blob(250,800,420,500)
light*=(0.15+0.85*smoothstep(80,560,yy))
light*=1-0.85*blob(1690,640,140,260)          # kill bright daylight door
light*=1-0.6*blob(1650,1050,420,250)           # calm clutter lower-right
bg=Lb*light[...,None]*BGR(1.15,0.90,0.70)
g=bg.mean(axis=2,keepdims=True); bg=g+(bg-g)*0.7
vig=1-0.9*smoothstep(0.30,1.0,np.sqrt(((xx-W*0.45)/(W*0.62))**2+((yy-H*0.48)/(H*0.60))**2))
bg*=vig[...,None]
img=bg.copy()
log('bg')

# ================= object geometry =================
_rgba=cv2.imread(os.path.join(HERE,'decoupe_tasse.png'),cv2.IMREAD_UNCHANGED); orgb=_rgba[...,:3]; oa=_rgba[...,3]
ecx,ecy=523.65,377.25
x0,x1,y0,y1=290,760,110,545
crop=orgb[y0:y1,x0:x1]; ca=oa[y0:y1,x0:x1]
ow,oh=int((x1-x0)*K),int((y1-y0)*K)
crop=cv2.resize(crop,(ow,oh),interpolation=cv2.INTER_LANCZOS4)
ca=cv2.resize(ca,(ow,oh),interpolation=cv2.INTER_LANCZOS4).astype(np.float32)/255
cl=crop.astype(np.float32); bl=cv2.GaussianBlur(cl,(0,0),1.6); cl=np.clip(cl+0.7*(cl-bl),0,255)
ox=int(round(CX-(ecx-x0)*K)); oy=int(round(CY-(ecy-y0)*K))
OBJ=np.zeros((H,W,3),np.float32); OA=np.zeros((H,W),np.float32)
OBJ[oy:oy+oh,ox:ox+ow]=lin(cl.astype(np.uint8)); OA[oy:oy+oh,ox:ox+ow]=ca
OA=np.clip((cv2.erode(OA,np.ones((3,3),np.uint8))-0.08)/0.92,0,1)
ea=224.2*K; eb=157.0*K
def rim_y(x):
    t=np.clip((x-CX)/ea,-0.999,0.999); return CY+eb*np.sqrt(1-t*t)

# ================= jets =================
JF=(-0.64,-0.21,0.23,0.63)
JX=[CX+ea*f for f in JF]
JY0=CY+0.30*eb
JA=np.zeros((H,W),np.float32); JB=np.zeros((H,W),np.float32); JE=np.zeros((H,W),np.float32)
wob=fbm(H,W,420,2,seed=5,aniso=1.5)
for i,jx in enumerate(JX):
    ry=float(rim_y(jx))
    v=np.clip((yy-ry)/(YF-ry),0,1)
    # flow-aligned noise: strong vertical stretch near the nozzle, isotropic lower
    st_hi=fbm(H,W,28,4,seed=40+i,aniso=10.0)
    st_lo=fbm(H,W,70,5,seed=10+i,aniso=6.0)
    bil=fbm(H,W,80,6,seed=20+i)
    edgen=fbm(H,W,40,5,seed=30+i,aniso=3.0)
    mixv=smoothstep(0.0,0.85,v)
    tex=(st_lo*0.6+st_hi*0.4)*(1-mixv)+bil*mixv
    xc=jx+(jx-CX)*0.10*v+(wob-0.5)*45*v**1.5
    w=6+98*v**1.15
    disp=(edgen-0.5)*w*(0.5+1.6*v)
    u=(xx-xc+disp)/w
    prof=np.exp(-0.5*np.abs(u)**2.4)
    dens=prof*(0.30+1.5*smoothstep(0.25,0.75,tex))*smoothstep(JY0,ry+3,yy)
    a_=1-np.exp(-dens*2.4)
    # brightness: textured, brighter near nozzle and on the left (key side)
    side=np.clip(0.5-0.35*u,0.15,1.0)
    br=(0.45+0.85*smoothstep(0.2,0.8,tex))*(0.55+0.75*np.exp(-np.clip(yy-ry,0,None)/240))*(0.75+0.5*side)
    # hot nozzle core (amber) fading quickly to white steam
    core=np.exp(-0.5*((xx-xc)/(3.0+10*v))**2)*np.exp(-np.clip(yy-ry,0,None)/95.)*smoothstep(JY0,ry+2,yy)
    JB=JB*(1-a_)+br*a_
    JA=1-(1-JA)*(1-a_)
    JE+=core
log('jets')

# ================= cloud (shaded billows, painter's algorithm) =================
DET=fbm(1024,1024,90,5,seed=77)
DWX=(fbm(1024,1024,160,3,seed=81)-0.5)*0.9; DWY=(fbm(1024,1024,160,3,seed=82)-0.5)*0.9
DET2=fbm(1024,1024,26,4,seed=78)
puffs=[]
for jx in JX:
    xi=jx+(jx-CX)*0.10
    for k in range(34):
        Rr=R.uniform(70,190)
        cx=xi+R.normal(0,70+Rr*0.55)
        h=R.uniform(0,1)
        cy=YF+10-h**0.85*300*np.exp(-((cx-xi)/250)**2)-Rr*0.3
        puffs.append((cx,cy,Rr))
    for k in range(14):
        t=R.uniform(0.5,0.95); y=JY0+t*(YF-JY0)
        Rr=18+130*(t-0.45)
        puffs.append((xi+R.normal(0,Rr*0.35),y,Rr))
mid=(JX[0]+JX[-1])/2
for k in range(170):
    cx=R.uniform(-220,W+220)
    dist=min(abs(cx-mid)/1050,1.3)
    cy=YF+20-R.uniform(0,1)**1.3*220*(1.05-0.72*dist)
    Rr=R.uniform(60,170)*(1.15-0.4*dist)
    puffs.append((cx,cy,Rr))
for k in range(70):
    cx=R.uniform(-100,W+100); dist=min(abs(cx-mid)/1100,1.2)
    if R.random()<dist*0.6: continue
    puffs.append((cx,YF+R.uniform(30,95),R.uniform(35,90)))
puffs.sort(key=lambda p:p[1]+0.25*p[2])
FLOOR=YF+62
Ld=np.array([-0.38,-0.78,0.50]); Ld/=np.linalg.norm(Ld)
STREAK_Y=1478
def render_layer(plist):
    Cl=np.zeros((H,W,3),np.float32); Al=np.zeros((H,W),np.float32)
    for (cx,cy,Rr) in plist:
        Rb=Rr*1.45
        xa,xb=int(max(cx-Rb,0)),int(min(cx+Rb,W)); ya,yb=int(max(cy-Rb,0)),int(min(cy+Rb,H))
        if xb<=xa or yb<=ya: continue
        X=xx[ya:yb,xa:xb]; Y=yy[ya:yb,xa:xb]
        o1,o2=R.integers(0,1024-(xb-xa)),R.integers(0,1024-(yb-ya))
        sl=(slice(o2,o2+yb-ya),slice(o1,o1+xb-xa))
        dx=(X-cx)/Rr+DWX[sl]; dy=(Y-cy)/Rr+DWY[sl]
        d=np.sqrt(dx*dx+dy*dy)
        nz=DET[sl]; nz2=DET2[sl]
        dd=d+0.45*(nz-0.5)+0.18*(nz2-0.5)
        a=smoothstep(1.0,0.30,dd)*0.90
        a*=smoothstep(FLOOR+70,FLOOR-25,Y+40*(nz-0.5))  # soft, irregular contact with the floor
        hh=np.sqrt(np.clip(1-d*d,0,1))
        lam=np.clip(dx*Ld[0]+dy*Ld[1]+hh*Ld[2],0,1)
        depth=smoothstep(FLOOR+40,FLOOR-380,cy)        # higher billows catch more light
        lf=0.25+0.75*np.exp(-((X-mid)/640)**2)
        shade=(0.10+0.80*lam**1.25)*(0.45+0.55*depth)*lf*(0.80+0.4*nz2)+0.06*(1-hh)
        G=sum(np.exp(-(((X-jx)/200)**2+((Y-(YF-90))/180)**2)) for jx in JX)
        glow=G*(0.30+0.70*(1-hh))*(0.7+0.5*nz2)
        og=np.exp(-((Y-STREAK_Y)/170)**2)*smoothstep(850,80,X)*(0.35+0.65*np.clip(-dx,0,1))
        col=BGR(0.93,0.89,0.85)*shade[...,None]+BGR(1.0,0.68,0.36)*(glow*0.52)[...,None]+BGR(1.0,0.32,0.10)*(og*0.45)[...,None]
        Cl[ya:yb,xa:xb]=Cl[ya:yb,xa:xb]*(1-a[...,None])+col*a[...,None]
        Al[ya:yb,xa:xb]=Al[ya:yb,xa:xb]*(1-a)+a
    Cl=cv2.GaussianBlur(Cl,(0,0),1.1); Al=cv2.GaussianBlur(Al,(0,0),1.1)
    return Cl,Al
back=[];front=[]
for p in puffs:
    (back if (p[1]<YF-150 or R.random()<0.45) else front).append(p)
CB,Aback=render_layer(back); CF,Afront=render_layer(front)

def add_streak(img):
    sx=smoothstep(700,60,xx)*smoothstep(-40,40,xx)
    core=np.exp(-((yy-STREAK_Y)/2.0)**2)*sx
    glow=np.exp(-((yy-STREAK_Y)/12)**2)*sx
    wide=np.exp(-((yy-STREAK_Y)/55)**2)*smoothstep(850,0,xx)
    img+=BGR(1.0,0.62,0.40)*(core*2.6)[...,None]+BGR(1.0,0.26,0.08)*(glow*0.8+wide*0.10)[...,None]

img=img*(1-Aback[...,None])+CB
log('back cloud')
JCOL=BGR(0.97,0.95,0.92)
img=img*(1-JA[...,None])+(JCOL*JB[...,None])
img+=BGR(1.0,0.80,0.50)*(JE*2.4)[...,None]+BGR(1.0,0.62,0.30)*(cv2.GaussianBlur(JE,(0,0),14)*2.2)[...,None]
img=img*(1-Afront[...,None])+CF
log('front cloud')

# ================= floor reflection =================
FL=YF+62
top=int(2*FL-H)
rs=img[top:int(FL)][::-1].copy()
rs=cv2.GaussianBlur(rs,(0,0),sigmaX=4,sigmaY=18)
n_=H-int(FL); fade=np.exp(-np.arange(n_)/45.)[:,None,None]
mm=smoothstep(FL+10,FL+70,yy[int(FL):H])[...,None]
img[int(FL):H]=img[int(FL):H]+0.07*rs[:n_]*fade*mm
add_streak(img)

# ================= object relight =================
o=OBJ.copy()
gx=(xx-ox)/ow; gy=(yy-oy)/oh
key=1.0-0.62*smoothstep(0.15,1.05,0.55*gx+0.80*gy)
o*=0.58*key[...,None]
o*=BGR(1.04,1.0,0.94)
ry_=rim_y(xx)
up=np.exp(-np.clip(ry_-yy,0,None)/14.)*(yy<ry_+8)*(np.abs(xx-CX)<ea)
up*=sum(np.exp(-((xx-jx)/150)**2) for jx in JX)
o+=BGR(1.0,0.58,0.26)*(np.clip(up,0,1.2)*0.45)[...,None]
er=cv2.erode(OA,np.ones((9,9),np.uint8))
edge=np.clip(OA-er,0,1)
gxa=cv2.Sobel(OA,cv2.CV_32F,1,0,ksize=5); gya=cv2.Sobel(OA,cv2.CV_32F,0,1,ksize=5)
nrm=np.sqrt(gxa**2+gya**2)+1e-6
facing=np.clip((gxa*0.7+gya*0.7)/nrm,0,1)
o+=BGR(1.0,0.80,0.56)*(cv2.GaussianBlur(edge*facing,(0,0),1.5)*0.22)[...,None]
# right-side subtle warm kicker from the banner light
facing_r=np.clip((-gxa)/nrm,0,1)
o+=BGR(1.0,0.66,0.40)*(cv2.GaussianBlur(edge*facing_r,(0,0),1.5)*0.12)[...,None]
img=img*(1-OA[...,None])+o*OA[...,None]
log('object')


# ================= rising steam from the coffee (particle wisps) =================
ccx=CX+(487-ecx)*K; ccy=CY+(200-ecy)*K; cax=112*K; cay=55*K
F=cv2.GaussianBlur(fbm(H,W,230,3,seed=91),(0,0),6)
F2=cv2.GaussianBlur(fbm(H,W,80,3,seed=92),(0,0),3)
cvx=np.gradient(F,axis=0)*230*2.2+np.gradient(F2,axis=0)*80*0.9
cvy=-np.gradient(F,axis=1)*230*2.2-np.gradient(F2,axis=1)*80*0.9
N=900; STEPS=420
rr=np.sqrt(R.random(N)); th=R.random(N)*2*np.pi
px=ccx+cax*0.85*rr*np.cos(th); py=ccy+cay*0.85*rr*np.sin(th)-cay*0.15
spd=R.uniform(1.4,2.6,N); wgt=R.uniform(0.5,1.0,N)*(R.random(N)<0.8)
life=R.uniform(200,STEPS,N)
phx=R.integers(-260,260,N); phy=R.integers(-260,260,N)
acc=np.zeros((H+2,W+2),np.float32)
for st in range(STEPS):
    ix=np.clip(px.astype(int),0,W-1); iy=np.clip(py.astype(int),0,H-1)
    hgt=np.clip(ccy-py,0,None)
    jx_=np.clip(ix+phx,0,W-1); jy_=np.clip(iy+phy,0,H-1)
    vx=cvx[jy_,jx_]*1.2-1.35*smoothstep(30,300,hgt)-0.2+R.normal(0,0.35,N)
    vy=-spd*(1-0.5*smoothstep(150,420,hgt))+cvy[jy_,jx_]*0.7+R.normal(0,0.25,N)
    px=px+vx; py=py+vy
    age=st/life
    w_=wgt*smoothstep(0,0.08,age)*np.clip(1-age,0,1)**1.5*0.032
    ok=(px>0)&(px<W-1)&(py>0)&(py<H-1)&(age<1)
    fx=px[ok]; fy=py[ok]; ww=w_[ok]
    x0_=fx.astype(int); y0_=fy.astype(int); ax_=fx-x0_; ay_=fy-y0_
    np.add.at(acc,(y0_,x0_),ww*(1-ax_)*(1-ay_)); np.add.at(acc,(y0_,x0_+1),ww*ax_*(1-ay_))
    np.add.at(acc,(y0_+1,x0_),ww*(1-ax_)*ay_); np.add.at(acc,(y0_+1,x0_+1),ww*ax_*ay_)
acc=acc[:H,:W]
d1=cv2.GaussianBlur(acc,(0,0),1.3); d2=cv2.GaussianBlur(acc,(0,0),5); d3=cv2.GaussianBlur(acc,(0,0),16)
dens=d1*0.6+d2*2.0+d3*3.6
# steam rising out of the cup must stay behind the front lip: hide below coffee surface front edge
front_lip=(yy>ccy+cay*0.55)&(np.abs(xx-ccx)<cax*1.15)
dens*=1-np.clip(front_lip.astype(np.float32)*OA,0,1)
dens*=smoothstep(-80,420,yy)
SA=1-np.exp(-dens*2.4)
slight=0.55+0.5*np.exp(-np.clip(ccy-yy,0,None)/300)
img=img*(1-SA[...,None]*0.85)+(BGR(0.96,0.92,0.88)*slight[...,None])*SA[...,None]*0.85
log('wisps')

# ================= post =================
x=img.copy()
lum=x.mean(axis=2)
bright=np.clip(x-0.65,0,None)
bloom=cv2.GaussianBlur(bright,(0,0),10)*0.45+cv2.GaussianBlur(bright,(0,0),40)*0.35+cv2.GaussianBlur(bright,(0,0),110)*0.25
x=x+bloom*BGR(1.0,0.85,0.7)
# filmic tone map (ACES fit)
e=1.15; x=x*e
x=(x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14)
x=np.clip(x,0,1)
out=srgb(x)
# gentle S-curve & warm/neutral split
out=out+0.06*np.sin((out-0.5)*np.pi)*0.5*0
out=np.clip(out,0,1)
gr=R.normal(0,0.012,(H,W)).astype(np.float32)
gr=cv2.GaussianBlur(gr,(0,0),0.6)
out=np.clip(out+gr[...,None],0,1)
o8=(out*255+0.5).astype(np.uint8)
cv2.imwrite(os.path.join(OUT,'boostcafe-tasse-envol-5x4.jpg'),o8,[cv2.IMWRITE_JPEG_QUALITY,95])
cv2.imwrite(os.path.join(OUT,'boostcafe-tasse-envol-4x5.jpg'),o8[:,240:1520],[cv2.IMWRITE_JPEG_QUALITY,95])
log('done')
