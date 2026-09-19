"""Original procedural brand score: no recordings, borrowed melody or third-party samples.
Optional asset regeneration only; npm run build does not require Python or ffmpeg.
Usage: python scripts/compose-score.py OUTPUT.wav
"""
import sys, wave
import numpy as np

rate=44100
beat=60/128
duration=64*beat
rng=np.random.default_rng(8132026)
mix=np.zeros((round((duration+5)*rate),2),np.float64)

def put(audio,start,level=.1,pan=0):
    n=round(start*rate); length=min(len(audio),len(mix)-n)
    if length<=0:return
    mix[n:n+length,0]+=audio[:length]*level*np.sqrt((1-pan)/2)
    mix[n:n+length,1]+=audio[:length]*level*np.sqrt((1+pan)/2)

def tone(midi,length,kind='pluck'):
    t=np.arange(round(length*rate))/rate
    hz=440*2**((midi-69)/12)
    if kind=='pad':
        signal=np.sin(2*np.pi*hz*t)+.2*np.sin(2*np.pi*hz*2*t+.1*np.sin(t))+.13*np.sin(2*np.pi*hz*1.0017*t)
        env=np.minimum(t/.8,1)*np.minimum(np.maximum(length-t,0)/1.5,1)
    elif kind=='bass':
        signal=np.sin(2*np.pi*hz*t)+.18*np.sin(2*np.pi*hz*2*t)
        env=np.minimum(t/.025,1)*np.exp(-t*2.4)
    else:
        signal=np.sin(2*np.pi*hz*t)+.32*np.sin(2*np.pi*hz*2*t)*np.exp(-t*5)+.10*np.sin(2*np.pi*hz*3*t)*np.exp(-t*8)
        env=(1-np.exp(-t*130))*np.exp(-t*3.5)
    return signal*env

# Bright D major harmony with an immediate rhythmic pulse; 16 original bars, four evolving phrases.
chords=[[50,57,61,66,69],[45,52,57,61,64],[43,50,57,59,62],[45,52,57,59,64]]
motifs=[[74,78,81,78,76,74],[78,81,83,81,78,76],[74,78,83,81,78,74],[76,81,83,78,76,73]]
for bar in range(16):
    start=bar*4*beat; chord=chords[bar%4]
    for i,note in enumerate(chord):put(tone(note+12,4*beat+2,'pad'),start,.018,(-.65+i*.3))
    if bar>=0:
        for offset in [0,.75,1.5,2,2.75,3.5]:put(tone(chord[0]-12,.8,'bass'),start+offset*beat,.18)
    if 0<=bar<16:
        for j,offset in enumerate([0,.75,1.5,2,2.75,3.5]):
            note=motifs[bar%4][j]
            line=tone(note,1.7)
            put(line,start+offset*beat,.105,(-.35 if j%2 else .35))
            for delay,level in [(beat*.75,.028),(beat*1.5,.012)]:put(line,start+offset*beat+delay,level,(.5 if j%2 else -.5))
    if 0<=bar<16:
        for offset in [0,1,2,3]:
            t=np.arange(round(.32*rate))/rate
            kick=np.sin(2*np.pi*(49*t+1.8*(1-np.exp(-t*25))))*np.exp(-t*15)
            put(kick,start+offset*beat,.34)
        for offset in [1,3]:
            t=np.arange(round(.18*rate))/rate; noise=rng.normal(0,1,len(t))
            brushed=(noise-np.roll(noise,1))*np.exp(-t*26)
            put(brushed,start+offset*beat,.025,-.05)
        for eighth in range(8):
            t=np.arange(round(.07*rate))/rate; noise=rng.normal(0,1,len(t))
            shaker=(noise-np.roll(noise,1))*np.exp(-t*70)
            put(shaker,start+(eighth*.5+.008*rng.uniform(-1,1))*beat,.011 if eighth%2 else .016,.45)
    if bar in [0,4,8,12]:put(tone(chord[-1]+24,4.5,'pad'),start,.015,-.4)

# Diffuse, quiet stereo reflections preserve rhythmic clarity.
dry=mix.copy()
for delay,level in [(.073,.11),(.127,.09),(.193,.065),(.311,.035)]:
    n=round(delay*rate);mix[n:]+=dry[:-n,::-1]*level
size=round(duration*rate)
# Fold the natural tail back into the beginning for a seamless musical loop.
tail=mix[size:];mix[:len(tail)]+=tail
mix=mix[:size]
mix=np.tanh(mix*1.1)
mix*=.82/max(.001,np.max(np.abs(mix)))
pcm=(mix*32767).astype('<i2')
with wave.open(sys.argv[1],'wb') as file:
    file.setnchannels(2);file.setsampwidth(2);file.setframerate(rate);file.writeframes(pcm.tobytes())
print(f'Original 128 BPM, {duration:.0f}-second stereo score written to {sys.argv[1]}')
