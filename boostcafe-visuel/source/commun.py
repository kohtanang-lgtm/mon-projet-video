import cv2, numpy as np
W,H=2000,1600
rng=np.random.default_rng(7)
def lin(img8): x=img8.astype(np.float32)/255.; return np.where(x<=0.04045,x/12.92,((x+0.055)/1.055)**2.4)
def srgb(x): x=np.clip(x,0,None); y=np.where(x<=0.0031308,x*12.92,1.055*np.power(x,1/2.4)-0.055); return np.clip(y,0,1)
def vnoise(h,w,cell_y,cell_x,seed):
    r=np.random.default_rng(seed)
    gh=int(np.ceil(h/cell_y))+3; gw=int(np.ceil(w/cell_x))+3
    g=r.random((gh,gw)).astype(np.float32)
    big=cv2.resize(g,(int(gw*cell_x),int(gh*cell_y)),interpolation=cv2.INTER_CUBIC)
    oy=int(cell_y); ox=int(cell_x)
    return big[oy:oy+h,ox:ox+w]
def fbm(h,w,cell,octaves=5,seed=0,aniso=1.0,gain=0.5,lac=2.0):
    out=np.zeros((h,w),np.float32); amp=1.0; tot=0; c=float(cell)
    for i in range(octaves):
        if c<1.5: break
        out+=amp*vnoise(h,w,c*aniso,c,seed*101+i); tot+=amp
        amp*=gain; c/=lac
    return out/tot
def warp(img,dx,dy):
    h,w=img.shape[:2]
    yy,xx=np.mgrid[0:h,0:w].astype(np.float32)
    return cv2.remap(img,(xx+dx).astype(np.float32),(yy+dy).astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT)
def disk_blur(img,r):
    k=np.zeros((2*r+1,2*r+1),np.float32); cv2.circle(k,(r,r),r,1,-1,cv2.LINE_AA); k/=k.sum()
    return cv2.filter2D(img,-1,k,borderType=cv2.BORDER_REFLECT)
def smoothstep(a,b,x):
    t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
