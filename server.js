<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
<title>H.A.L.O. // STARK SYSTEMS</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Exo+2:wght@300;400;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
<style>
:root{
  --b:#1a8fff;--b2:#00cfff;--b3:#0055bb;--bdim:#0a2a5e;
  --glow:0 0 15px #1a8fff66,0 0 40px #1a8fff22;
  --glow2:0 0 12px #00cfffaa;
  --bg:#010914;--panel:rgba(1,12,30,0.88);--border:rgba(26,143,255,0.18);
  --text:#8ec8ff;--bright:#d0eaff;
}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:100%;height:100%;overflow:hidden;background:var(--bg);font-family:'Exo 2',sans-serif;color:var(--text);}

/* BOOT OVERLAY */
#boot{position:fixed;inset:0;background:#010914;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;}
#boot.done{display:none;}
.boot-logo{font-family:'Orbitron',monospace;font-size:clamp(24px,5vw,48px);font-weight:900;letter-spacing:16px;color:var(--b2);text-shadow:var(--glow2);margin-bottom:6px;}
.boot-sub{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:5px;color:rgba(26,143,255,0.4);margin-bottom:40px;}
.boot-lines{width:min(500px,90vw);display:flex;flex-direction:column;gap:4px;}
.boot-line{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:1px;color:rgba(26,143,255,0.0);white-space:nowrap;overflow:hidden;}
.boot-line.show{animation:bootReveal 0.3s ease forwards;}
.boot-bar-wrap{width:min(500px,90vw);height:3px;background:rgba(26,143,255,0.1);border-radius:2px;margin-top:20px;overflow:hidden;}
.boot-bar{height:100%;background:linear-gradient(90deg,var(--b3),var(--b2));width:0%;transition:width 0.1s linear;box-shadow:0 0 10px var(--b2);}
@keyframes bootReveal{from{color:rgba(26,143,255,0);}to{color:rgba(26,143,255,0.6);}}

/* GRID BG */
body::before{content:'';position:fixed;inset:0;
  background-image:linear-gradient(rgba(26,143,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(26,143,255,0.025) 1px,transparent 1px);
  background-size:50px 50px;pointer-events:none;z-index:0;}
body::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(26,143,255,0.006) 3px,rgba(26,143,255,0.006) 4px);pointer-events:none;z-index:1000;}

/* ANIMATIONS */
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes spinr{to{transform:rotate(-360deg);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.15;}}
@keyframes bpulse{0%,100%{box-shadow:0 0 15px #1a8fff55,0 0 40px #1a8fff22;}50%{box-shadow:0 0 35px #1a8fffaa,0 0 80px #1a8fff44;}}
@keyframes ripple{0%{transform:scale(0.85);opacity:0.7;}100%{transform:scale(2.8);opacity:0;}}
@keyframes scanline{0%{top:-5%;}100%{top:105%;}}
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes flicker{0%,94%,100%{opacity:1;}95%{opacity:0.3;}97%{opacity:0.8;}}
@keyframes radarSpin{to{transform:rotate(360deg);}}
@keyframes borderAnim{0%,100%{border-color:rgba(26,143,255,0.18);}50%{border-color:rgba(26,143,255,0.4);}}
@keyframes dash{to{stroke-dashoffset:-100;}}
@keyframes typeIn{from{width:0;}to{width:100%;}}
@keyframes glowPop{0%{opacity:0;transform:scale(0.92);}60%{opacity:1;transform:scale(1.02);}100%{transform:scale(1);}}

/* MAIN LAYOUT — full viewport */
#halo{position:fixed;inset:0;display:grid;grid-template-rows:auto 1fr auto;z-index:2;padding:8px 12px;gap:8px;}

/* ── TOP BAR ── */
#topbar{display:grid;grid-template-columns:auto auto 1fr auto auto;align-items:center;gap:12px;border-bottom:1px solid rgba(26,143,255,0.12);padding-bottom:8px;position:relative;}
#topbar::after{content:'';position:absolute;bottom:0;left:5%;right:5%;height:1px;background:linear-gradient(90deg,transparent,var(--b2),transparent);}

/* Weather circle */
.circle-widget{width:80px;height:80px;border-radius:50%;border:2px solid rgba(26,143,255,0.3);background:radial-gradient(circle,rgba(26,143,255,0.08),transparent);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;flex-shrink:0;box-shadow:0 0 20px rgba(26,143,255,0.15);animation:borderAnim 3s infinite;}
.circle-widget::before{content:'';position:absolute;inset:-4px;border-radius:50%;border:1px solid rgba(26,143,255,0.08);animation:spin 20s linear infinite;}
.circle-widget::after{content:'';position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(26,143,255,0.04);}
.cw-val{font-family:'Orbitron',monospace;font-size:18px;font-weight:900;color:var(--b2);text-shadow:var(--glow2);line-height:1;}
.cw-lbl{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:2px;color:rgba(26,143,255,0.35);text-align:center;margin-top:2px;}
.cw-sub{font-size:7px;color:rgba(26,143,255,0.25);font-family:'Share Tech Mono',monospace;margin-top:1px;}

/* Clock circle */
.clock-circle{width:100px;height:100px;border-radius:50%;border:2px solid rgba(26,143,255,0.35);background:radial-gradient(circle,rgba(26,143,255,0.1),transparent);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;flex-shrink:0;box-shadow:0 0 25px rgba(26,143,255,0.2);}
.clock-circle::before{content:'';position:absolute;inset:-5px;border-radius:50%;border:1px solid rgba(26,143,255,0.1);animation:spinr 15s linear infinite;}
.cc-time{font-family:'Orbitron',monospace;font-size:clamp(13px,1.8vw,16px);font-weight:900;color:var(--b2);letter-spacing:2px;text-shadow:var(--glow2);line-height:1;}
.cc-date{font-family:'Share Tech Mono',monospace;font-size:7px;color:rgba(26,143,255,0.4);text-align:center;margin-top:3px;letter-spacing:1px;}

/* Center title */
.halo-title{font-family:'Orbitron',monospace;font-size:clamp(16px,2.5vw,28px);font-weight:900;letter-spacing:12px;color:var(--b2);text-shadow:var(--glow2);text-align:center;animation:flicker 9s infinite;}
.halo-subtitle{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:4px;color:rgba(26,143,255,0.3);text-align:center;margin-top:2px;}

/* Status right */
.status-area{text-align:right;font-family:'Share Tech Mono',monospace;}
.st-row{font-size:8px;letter-spacing:2px;color:rgba(26,143,255,0.3);line-height:2.4;}
.st-on{color:#00ff88;}.st-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#00ff88;margin-right:4px;animation:pulse 1.5s infinite;vertical-align:middle;}
.stark-logo{font-family:'Orbitron',monospace;font-size:9px;font-weight:700;color:rgba(26,143,255,0.25);letter-spacing:3px;margin-top:4px;}

/* ── MIDDLE ROW ── */
#midrow{display:grid;grid-template-columns:200px 1fr 200px;gap:10px;min-height:0;}

/* SIDE PANELS */
.side-panel{display:flex;flex-direction:column;gap:8px;overflow:hidden;}

.pnl{background:var(--panel);border:1px solid var(--border);border-radius:3px;padding:10px;position:relative;overflow:hidden;animation:borderAnim 4s infinite;}
.pnl::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(26,143,255,0.5),transparent);}
.pnl::after{content:'';position:absolute;top:0;left:0;width:10px;height:10px;border-top:1px solid var(--b);border-left:1px solid var(--b);}
.pnl-scan{position:absolute;left:0;right:0;height:50px;background:linear-gradient(180deg,transparent,rgba(26,143,255,0.03),transparent);animation:scanline 5s linear infinite;pointer-events:none;}
.plbl{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:3px;color:rgba(26,143,255,0.3);margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.plbl::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--b);animation:pulse 2s infinite;flex-shrink:0;}
.plbl::after{content:'';flex:1;height:1px;background:rgba(26,143,255,0.08);}

/* TASKS */
.trow{display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid rgba(26,143,255,0.05);cursor:pointer;transition:all 0.2s;}
.trow:hover{padding-left:4px;background:rgba(26,143,255,0.04);}
.trow.done .tlbl{color:rgba(26,143,255,0.2);text-decoration:line-through;}
.tcheck{width:12px;height:12px;border:1px solid rgba(26,143,255,0.25);border-radius:2px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:8px;color:#00ff88;}
.trow.done .tcheck{background:rgba(0,255,136,0.1);border-color:rgba(0,255,136,0.3);}
.tlbl{font-size:10px;color:var(--text);flex:1;line-height:1.3;}
.ttime{font-size:7px;color:rgba(26,143,255,0.2);font-family:'Share Tech Mono',monospace;white-space:nowrap;}
.add-row{display:flex;gap:4px;margin-top:8px;}
.ainp{flex:1;background:rgba(26,143,255,0.04);border:1px solid rgba(26,143,255,0.12);color:var(--bright);font-family:'Share Tech Mono',monospace;font-size:9px;padding:5px 7px;border-radius:2px;outline:none;min-width:0;}
.ainp:focus{border-color:rgba(26,143,255,0.4);}
.ainp::placeholder{color:rgba(26,143,255,0.15);}
.abtn{background:rgba(26,143,255,0.08);border:1px solid rgba(26,143,255,0.2);color:var(--b2);font-family:'Share Tech Mono',monospace;font-size:8px;padding:5px 8px;border-radius:2px;cursor:pointer;white-space:nowrap;transition:all 0.2s;}
.abtn:hover{background:rgba(26,143,255,0.16);}

/* ALERTS */
.rrow{display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid rgba(26,143,255,0.05);}
.rbar{width:2px;height:24px;border-radius:1px;flex-shrink:0;}
.bhi{background:#ff3355;}.bmd{background:#ffaa00;}.blo{background:#00ff88;}
.rtxt{font-size:10px;color:var(--text);flex:1;line-height:1.3;}
.rtag{font-size:6px;letter-spacing:2px;padding:2px 5px;border-radius:2px;font-family:'Share Tech Mono',monospace;white-space:nowrap;}
.tthi{background:rgba(255,51,85,0.1);color:#ff3355;border:1px solid rgba(255,51,85,0.3);}
.ttmd{background:rgba(255,170,0,0.1);color:#ffaa00;border:1px solid rgba(255,170,0,0.3);}
.ttlo{background:rgba(0,255,136,0.1);color:#00ff88;border:1px solid rgba(0,255,136,0.3);}

/* QUICK BTNS */
.qgrid{display:flex;flex-direction:column;gap:5px;}
.qbtn{background:rgba(26,143,255,0.04);border:1px solid rgba(26,143,255,0.1);color:rgba(26,143,255,0.45);font-family:'Share Tech Mono',monospace;font-size:8px;padding:7px 8px;border-radius:2px;cursor:pointer;text-align:left;letter-spacing:1px;transition:all 0.2s;line-height:1.3;}
.qbtn:hover{background:rgba(26,143,255,0.1);color:var(--b2);border-color:rgba(26,143,255,0.3);}

/* ── CENTER HUB ── */
.center-hub{display:flex;flex-direction:column;align-items:center;gap:10px;overflow:hidden;}

/* REACTOR + VOICE side by side */
.hub-row{display:flex;align-items:center;gap:16px;width:100%;justify-content:center;}

/* REACTOR */
.reactor-zone{position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
#reactorOuter{width:clamp(160px,18vw,220px);height:clamp(160px,18vw,220px);position:relative;}
#barCanvas{position:absolute;inset:0;width:100%;height:100%;}
.reactor-rings{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
.ring{position:absolute;border-radius:50%;border:1px solid transparent;}
.r1{width:92%;height:92%;border-color:rgba(26,143,255,0.06);}
.r2{width:78%;height:78%;border-color:rgba(26,143,255,0.1);animation:spin 25s linear infinite;}
.r2i{width:100%;height:100%;border-radius:50%;border:1px solid transparent;border-top-color:rgba(26,143,255,0.55);border-right-color:rgba(26,143,255,0.2);}
.r3{width:62%;height:62%;border-color:rgba(26,143,255,0.14);animation:spinr 14s linear infinite;}
.r3i{width:100%;height:100%;border-radius:50%;border:1px solid transparent;border-bottom-color:rgba(0,207,255,0.65);border-left-color:rgba(26,143,255,0.2);}
.r4{width:46%;height:46%;border-color:rgba(26,143,255,0.2);animation:spin 9s linear infinite;}
.r4i{width:100%;height:100%;border-radius:50%;border:1px solid transparent;border-top-color:var(--b2);border-right-color:rgba(26,143,255,0.3);}
.r5{width:32%;height:32%;border-color:rgba(0,207,255,0.3);animation:spinr 5s linear infinite;}
.reactor-core{position:absolute;width:20%;height:20%;border-radius:50%;background:radial-gradient(circle,#80d4ff,#1a8fff,#0840a0);box-shadow:0 0 20px #1a8fffaa,0 0 60px #1a8fff44;animation:bpulse 2.5s infinite;display:flex;align-items:center;justify-content:center;}
.core-dot{width:40%;height:40%;border-radius:50%;background:radial-gradient(circle,#fff,#aae0ff);}
.rip{position:absolute;inset:8%;border-radius:50%;border:1px solid rgba(26,143,255,0.35);opacity:0;pointer-events:none;}
.rip.active{animation:ripple 1.6s linear infinite;}
.rip2{position:absolute;inset:18%;border-radius:50%;border:1px solid rgba(26,143,255,0.18);opacity:0;pointer-events:none;}
.rip2.active{animation:ripple 1.6s linear 0.55s infinite;}

/* VOICE BOX */
.voice-box{flex:1;max-width:340px;background:rgba(1,10,28,0.9);border:1px solid rgba(26,143,255,0.2);border-radius:4px;padding:12px;display:flex;flex-direction:column;gap:8px;position:relative;overflow:hidden;}
.voice-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--b2),transparent);}
.voice-box::after{content:'';position:absolute;top:0;left:0;width:8px;height:8px;border-top:1px solid var(--b);border-left:1px solid var(--b);}
.wake-row{display:flex;align-items:center;gap:8px;}
.wake-dot{width:8px;height:8px;border-radius:50%;background:rgba(26,143,255,0.15);transition:all 0.3s;flex-shrink:0;}
.wake-dot.speaking{background:#1a8fff;animation:pulse 0.5s infinite;box-shadow:0 0 12px #1a8fff;}
.wake-dot.listening{background:#00ff88;animation:pulse 0.5s infinite;box-shadow:0 0 12px #00ff88;}
.wake-dot.heard{background:#ffaa00;box-shadow:0 0 10px #ffaa00;}
.wake-dot.armed{background:rgba(26,143,255,0.4);animation:pulse 2s infinite;}
.wake-txt{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:3px;color:rgba(26,143,255,0.35);text-transform:uppercase;}

.waveform{display:flex;align-items:center;justify-content:center;gap:2px;height:32px;}
.wb{width:2.5px;background:linear-gradient(180deg,var(--b2),var(--b3));border-radius:2px;height:3px;transition:height 0.08s;opacity:0.4;}
.wb.active{opacity:1;}

.chat-feed{height:120px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(26,143,255,0.15) transparent;padding:4px 0;}
.chat-feed::-webkit-scrollbar{width:2px;}
.chat-feed::-webkit-scrollbar-thumb{background:rgba(26,143,255,0.2);border-radius:1px;}
.msg-lbl{font-size:7px;letter-spacing:2px;color:rgba(26,143,255,0.25);font-family:'Share Tech Mono',monospace;margin-bottom:2px;}
.msg-h{font-size:11px;color:var(--bright);line-height:1.6;padding:6px 8px;background:rgba(26,143,255,0.05);border-left:2px solid var(--b);margin-bottom:8px;border-radius:0 2px 2px 0;}
.msg-u{font-size:10px;color:rgba(26,143,255,0.4);padding:5px 8px;margin-bottom:8px;text-align:right;border-right:2px solid rgba(26,143,255,0.25);font-family:'Share Tech Mono',monospace;}

.inp-row{display:flex;gap:6px;}
.txt-inp{flex:1;background:rgba(26,143,255,0.04);border:1px solid rgba(26,143,255,0.12);color:var(--bright);font-family:'Exo 2',sans-serif;font-size:11px;padding:8px 10px;border-radius:2px;outline:none;transition:all 0.2s;}
.txt-inp:focus{border-color:rgba(26,143,255,0.45);box-shadow:0 0 12px rgba(26,143,255,0.08);}
.txt-inp::placeholder{color:rgba(26,143,255,0.18);}
.send-btn{background:rgba(26,143,255,0.1);border:1px solid rgba(26,143,255,0.3);color:var(--b2);font-family:'Orbitron',monospace;font-size:8px;font-weight:700;padding:8px 12px;border-radius:2px;cursor:pointer;letter-spacing:2px;transition:all 0.2s;}
.send-btn:hover{background:rgba(26,143,255,0.2);}

#activateVoiceBtn{width:100%;background:rgba(26,143,255,0.05);border:1px solid rgba(26,143,255,0.2);color:var(--b2);font-family:'Share Tech Mono',monospace;font-size:8px;padding:8px;border-radius:2px;cursor:pointer;letter-spacing:3px;transition:all 0.3s;}
#activateVoiceBtn:hover{background:rgba(26,143,255,0.1);}

.wake-toggle-row{display:flex;align-items:center;gap:6px;}
.wlbl{font-size:7px;letter-spacing:2px;color:rgba(26,143,255,0.25);font-family:'Share Tech Mono',monospace;}
.tog-btn{background:rgba(26,143,255,0.06);border:1px solid rgba(26,143,255,0.18);color:rgba(26,143,255,0.35);font-family:'Share Tech Mono',monospace;font-size:7px;padding:3px 8px;border-radius:2px;cursor:pointer;letter-spacing:1px;}
.tog-btn.on{background:rgba(26,143,255,0.14);border-color:rgba(26,143,255,0.45);color:var(--b2);}
.wklbl{font-size:7px;color:rgba(26,143,255,0.2);font-family:'Share Tech Mono',monospace;}

/* INTEL PANEL (below hub row) */
.intel-panel{display:none;background:rgba(1,8,22,0.95);border:1px solid rgba(26,143,255,0.25);border-radius:3px;padding:14px;width:100%;animation:glowPop 0.4s ease;}
.intel-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--b2),transparent);}
.intel-panel.visible{display:block;}
.intel-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.intel-title{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;color:var(--b2);letter-spacing:4px;}
.intel-close{background:none;border:1px solid rgba(26,143,255,0.18);color:rgba(26,143,255,0.35);font-family:'Share Tech Mono',monospace;font-size:7px;padding:3px 7px;cursor:pointer;border-radius:2px;letter-spacing:1px;}
.intel-close:hover{color:var(--b2);}
.intel-body{font-size:11px;color:var(--text);line-height:1.8;font-weight:300;max-height:160px;overflow-y:auto;scrollbar-width:thin;}
.intel-body h3{color:var(--b2);font-size:9px;letter-spacing:3px;margin:10px 0 5px;font-family:'Share Tech Mono',monospace;font-weight:400;}
.intel-body p{margin-bottom:8px;color:rgba(142,200,255,0.8);}
.intel-body strong{color:var(--bright);}
.intel-body ul{padding-left:14px;margin-bottom:8px;}
.intel-body li{margin-bottom:5px;color:rgba(142,200,255,0.7);}
.intel-loading{display:flex;align-items:center;gap:10px;color:rgba(26,143,255,0.4);font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:2px;}
.intel-spin{width:14px;height:14px;border:2px solid rgba(26,143,255,0.1);border-top-color:var(--b2);border-radius:50%;animation:spin 0.8s linear infinite;}

/* HUD STRIP */
.hud-strip{display:flex;gap:2px;width:100%;}
.hs{height:2px;flex:1;background:rgba(26,143,255,0.06);border-radius:1px;}
.hs.a{background:rgba(26,143,255,0.35);}
.hs.b{background:rgba(26,143,255,0.6);}
.hs.c{background:var(--b2);}

/* ── BOTTOM STRIP ── */
#botstrip{display:flex;align-items:flex-end;gap:8px;border-top:1px solid rgba(26,143,255,0.1);padding-top:8px;}

/* DIAGNOSTICS bar */
.diag-bar{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.diag-item{background:rgba(1,12,30,0.8);border:1px solid rgba(26,143,255,0.1);border-radius:2px;padding:5px 7px;position:relative;}
.diag-item::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(26,143,255,0.3),transparent);}
.di-lbl{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:2px;color:rgba(26,143,255,0.28);}
.di-val{font-family:'Orbitron',monospace;font-size:11px;font-weight:700;color:var(--b2);margin-top:1px;}
.di-bar{height:2px;background:rgba(26,143,255,0.1);border-radius:1px;margin-top:4px;overflow:hidden;}
.di-fill{height:100%;border-radius:1px;box-shadow:0 0 4px currentColor;}

/* KEY BANNER */
.key-banner{position:fixed;top:0;left:0;right:0;z-index:8888;background:rgba(200,10,10,0.08);border-bottom:1px solid rgba(255,50,50,0.2);padding:8px 14px;display:flex;align-items:center;gap:8px;font-family:'Share Tech Mono',monospace;font-size:10px;}
.key-banner.hidden{display:none;}
.key-banner input{flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,60,60,0.2);color:#ff9999;font-family:'Share Tech Mono',monospace;font-size:10px;padding:6px 10px;border-radius:2px;outline:none;max-width:500px;}
.key-banner input::placeholder{color:rgba(255,100,100,0.25);}
.key-banner button{background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff8888;font-family:'Share Tech Mono',monospace;font-size:8px;padding:6px 12px;border-radius:2px;cursor:pointer;letter-spacing:2px;}

/* SOCIAL CIRCLES */
.social-circle{width:64px;height:64px;border-radius:50%;position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s;}
.social-circle:hover .sc-inner{box-shadow:0 0 25px rgba(26,143,255,0.5);border-color:rgba(26,143,255,0.6);}
.social-circle:hover .sc-ring1{border-color:rgba(26,143,255,0.4);}
.social-circle:hover{transform:scale(1.08);}
.sc-ring{position:absolute;border-radius:50%;border:1px solid transparent;}
.sc-ring1{inset:0;border-color:rgba(26,143,255,0.2);animation:spin 12s linear infinite;}
.sc-ring2{inset:4px;border-color:rgba(26,143,255,0.1);animation:spinr 8s linear infinite;}
.sc-inner{width:48px;height:48px;border-radius:50%;background:rgba(1,12,30,0.9);border:1px solid rgba(26,143,255,0.25);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;color:var(--b2);transition:all 0.3s;box-shadow:0 0 12px rgba(26,143,255,0.15);}
.sc-lbl{font-family:'Share Tech Mono',monospace;font-size:6px;letter-spacing:1px;color:rgba(26,143,255,0.4);}
.sc-pulse{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(26,143,255,0.3);animation:ripple 3s linear infinite;opacity:0;}
.social-circle:hover .sc-pulse{opacity:1;}

/* ANALYTICS LINES */
.stat-line{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(26,143,255,0.06);animation:fadeSlideUp 0.3s ease both;}
.stat-line:last-child{border-bottom:none;}
.stat-icon{width:6px;height:6px;border-radius:50%;background:var(--b2);flex-shrink:0;box-shadow:0 0 6px var(--b2);}
.stat-label{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:2px;color:rgba(26,143,255,0.35);flex:1;}
.stat-value{font-family:'Orbitron',monospace;font-size:12px;font-weight:700;color:var(--b2);text-shadow:0 0 8px rgba(26,143,255,0.4);}
.stat-bar-wrap{height:2px;background:rgba(26,143,255,0.08);border-radius:1px;margin-top:2px;overflow:hidden;}
.stat-bar{height:100%;border-radius:1px;transition:width 1s ease;}

.analytics-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}
.analytics-card{background:rgba(26,143,255,0.04);border:1px solid rgba(26,143,255,0.1);border-radius:3px;padding:8px;text-align:center;animation:glowPop 0.4s ease both;}
.ac-val{font-family:'Orbitron',monospace;font-size:16px;font-weight:700;color:var(--b2);text-shadow:0 0 10px rgba(26,143,255,0.4);}
.ac-lbl{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:2px;color:rgba(26,143,255,0.3);margin-top:3px;}

.connect-notice{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:1px;color:rgba(26,143,255,0.25);text-align:center;padding:8px;border:1px solid rgba(26,143,255,0.08);border-radius:2px;line-height:1.8;margin-top:8px;}

div{position:relative;}
</style>
</head>
<body>

<!-- BOOT SCREEN -->
<div id="boot">
  <div class="boot-logo">H.A.L.O.</div>
  <div class="boot-sub">HIGHLY ADVANCED LOGISTICS OPERATOR // STARK SYSTEMS</div>
  <div class="boot-lines" id="bootLines"></div>
  <div class="boot-bar-wrap"><div class="boot-bar" id="bootBar"></div></div>
</div>

<!-- SOCIAL ANALYTICS OVERLAY -->
<div id="socialOverlay" style="display:none;position:fixed;inset:0;z-index:5000;pointer-events:none;">
  <div id="socialPanel" style="position:absolute;background:rgba(1,8,22,0.97);border:1px solid rgba(26,143,255,0.4);border-radius:4px;padding:16px;min-width:280px;pointer-events:all;animation:glowPop 0.4s ease;">
    <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--b2),transparent);"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div id="socialPanelTitle" style="font-family:'Orbitron',monospace;font-size:10px;font-weight:700;color:var(--b2);letter-spacing:4px;"></div>
      <button onclick="closeSocialPanel()" style="background:none;border:1px solid rgba(26,143,255,0.2);color:rgba(26,143,255,0.4);font-family:'Share Tech Mono',monospace;font-size:7px;padding:3px 8px;cursor:pointer;border-radius:2px;letter-spacing:1px;">✕ CLOSE</button>
    </div>
    <div id="socialPanelBody"></div>
  </div>
</div>

<!-- KEY BANNER -->
<div class="key-banner" id="keyBanner">
  <span style="color:rgba(255,100,100,0.5);letter-spacing:2px;font-size:8px;">API KEY REQUIRED</span>
  <input type="password" id="keyInp" placeholder="sk-ant-..." onkeydown="if(event.key==='Enter')saveKey()"/>
  <button onclick="saveKey()">ACTIVATE</button>
</div>

<!-- MAIN HUD -->
<div id="halo" style="opacity:0;transition:opacity 0.5s;">

  <!-- TOP BAR -->
  <div id="topbar">
    <!-- Weather Circle -->
    <div class="circle-widget">
      <div class="cw-val" id="wtemp">--°</div>
      <div class="cw-lbl" id="wdesc">WEATHER</div>
      <div class="cw-sub">LOS ANGELES</div>
    </div>
    <!-- Clock Circle -->
    <div class="clock-circle">
      <div class="cc-time" id="hclock">00:00:00</div>
      <div class="cc-date" id="hdate">MON // JAN 01</div>
    </div>
    <!-- Center Title -->
    <div style="text-align:center;">
      <div class="halo-title">H.A.L.O.</div>
      <div class="halo-subtitle">HIGHLY ADVANCED LOGISTICS OPERATOR</div>
    </div>
    <!-- Status -->
    <div class="status-area">
      <div class="st-row"><span class="st-dot"></span><span class="st-on" id="apiStatus">AWAITING KEY</span></div>
      <div class="st-row">UPTIME // <span id="hpend">0 PENDING</span></div>
      <div class="st-row" id="hgreet">GOOD MORNING</div>
    </div>
    <div style="text-align:right;">
      <div class="stark-logo">STARK INDUSTRIES</div>
    </div>
  </div>

  <!-- HUD STRIP -->
  <div class="hud-strip">
    <div class="hs b"></div><div class="hs a"></div><div class="hs c"></div><div class="hs b"></div><div class="hs a"></div><div class="hs"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs b"></div><div class="hs"></div><div class="hs a"></div><div class="hs c"></div><div class="hs b"></div><div class="hs a"></div><div class="hs"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs b"></div><div class="hs a"></div><div class="hs c"></div><div class="hs b"></div><div class="hs a"></div><div class="hs"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs b"></div><div class="hs"></div><div class="hs a"></div><div class="hs c"></div><div class="hs b"></div>
  </div>

  <!-- MID ROW -->
  <div id="midrow">

    <!-- LEFT SIDE PANEL -->
    <div class="side-panel">
      <!-- Mission Objectives -->
      <div class="pnl" style="flex:1;">
        <div class="pnl-scan"></div>
        <div class="plbl">Mission Objectives</div>
        <div id="tlist"></div>
        <div style="height:2px;background:rgba(26,143,255,0.08);border-radius:1px;margin-top:6px;overflow:hidden;"><div id="sprog" style="height:100%;background:linear-gradient(90deg,var(--b3),var(--b2));width:0%;transition:width 0.5s;box-shadow:0 0 6px var(--b);"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:7px;color:rgba(26,143,255,0.25);font-family:'Share Tech Mono',monospace;margin-top:3px;"><span id="sdone">0/0</span><span>PROGRESS</span></div>
        <div class="add-row"><input class="ainp" id="tinp" placeholder="New objective..."/><button class="abtn" onclick="addTask()">+</button></div>
      </div>
      <!-- Priority Alerts -->
      <div class="pnl">
        <div class="pnl-scan"></div>
        <div class="plbl">Priority Alerts</div>
        <div id="rlist"></div>
        <div class="add-row">
          <input class="ainp" id="rinp" placeholder="New alert..."/>
          <select id="rpri" class="ainp" style="flex:0 0 45px;padding:4px;"><option value="hi">HI</option><option value="md">MD</option><option value="lo">LO</option></select>
          <button class="abtn" onclick="addRem()">+</button>
        </div>
      </div>
    </div>

    <!-- CENTER HUB -->
    <div class="center-hub">
      <!-- Reactor + Voice Box -->
      <div class="hub-row">
        <!-- Reactor -->
        <div class="reactor-zone">
          <div id="reactorOuter">
            <canvas id="barCanvas"></canvas>
            <div class="reactor-rings">
              <div class="ring r1"></div>
              <div class="ring r2"><div class="r2i"></div></div>
              <div class="ring r3"><div class="r3i"></div></div>
              <div class="ring r4"><div class="r4i"></div></div>
              <div class="ring r5"></div>
              <div class="reactor-core"><div class="core-dot"></div></div>
              <div class="rip" id="rip1"></div>
              <div class="rip2" id="rip2"></div>
            </div>
          </div>
        </div>

        <!-- Voice Box -->
        <div class="voice-box">
          <div class="wake-row">
            <div class="wake-dot" id="wakeDot"></div>
            <div class="wake-txt" id="wakeTxt">STANDBY</div>
          </div>
          <div class="waveform">
            <div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div><div class="wb"></div>
          </div>
          <div class="chat-feed" id="chatFeed"></div>
          <div class="inp-row">
            <input class="txt-inp" id="textInp" placeholder="Ask HALO anything..."/>
            <button class="send-btn" onclick="sendText()">SEND</button>
          </div>
          <button id="activateVoiceBtn" onclick="activateVoice()">▶ TAP TO ACTIVATE VOICE</button>
          <div class="wake-toggle-row">
            <span class="wlbl">Always-on:</span>
            <button class="tog-btn" id="alwaysOnBtn" onclick="toggleAlwaysOn()">Off</button>
            <span class="wklbl">"Hey HALO"</span>
          </div>
        </div>
      </div>

      <!-- Intel Panel -->
      <div class="intel-panel" id="intelPanel" style="position:relative;">
        <div class="intel-hdr">
          <div class="intel-title" id="intelTitle">INTEL FEED</div>
          <button class="intel-close" onclick="closeIntel()">✕ CLOSE</button>
        </div>
        <div class="intel-body" id="intelBody"></div>
      </div>
    </div>

    <!-- RIGHT SIDE PANEL -->
    <div class="side-panel">
      <!-- Quick Directives -->
      <div class="pnl" style="flex:1;">
        <div class="pnl-scan"></div>
        <div class="plbl">Quick Directives</div>
        <div class="qgrid">
          <button class="qbtn" onclick="askHalo('Give me a sharp mission briefing for today')">Today briefing ↗</button>
          <button class="qbtn" onclick="askHalo('Prioritise my tasks by urgency')">Prioritise tasks ↗</button>
          <button class="qbtn" onclick="askHalo('Explain how black holes work')">Black holes ↗</button>
          <button class="qbtn" onclick="askHalo('Top 5 productivity strategies')">Productivity ↗</button>
          <button class="qbtn" onclick="askHalo('What is stoicism?')">Stoicism brief ↗</button>
          <button class="qbtn" onclick="askHalo('Latest news today')">Latest news ↗</button>
        </div>
      </div>
      <!-- Omkeer Ops -->
      <div class="pnl">
        <div class="pnl-scan"></div>
        <div class="plbl">Omkeer Operations</div>
        <div class="qgrid">
          <button class="qbtn" onclick="askHalo('Generate Omkeer caption ideas for Instagram')">Captions ↗</button>
          <button class="qbtn" onclick="askHalo('What should Omkeer post this week?')">Strategy ↗</button>
          <button class="qbtn" onclick="askHalo('Write a faith-driven caption for a new drop')">New drop ↗</button>
          <button class="qbtn" onclick="askHalo('Analyze best posting times for streetwear brands')">Best times ↗</button>
        </div>
        <div style="margin-top:8px;font-size:7px;color:rgba(26,143,255,0.18);font-family:'Share Tech Mono',monospace;text-align:center;letter-spacing:2px;">NOT A TEAM. A BELIEF.</div>
      </div>
    </div>

  </div>

  <!-- HUD STRIP -->
  <div class="hud-strip">
    <div class="hs c"></div><div class="hs b"></div><div class="hs a"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs b"></div><div class="hs"></div><div class="hs a"></div><div class="hs c"></div><div class="hs b"></div><div class="hs a"></div><div class="hs"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs b"></div><div class="hs a"></div><div class="hs c"></div><div class="hs b"></div><div class="hs a"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs b"></div><div class="hs c"></div><div class="hs a"></div><div class="hs b"></div><div class="hs"></div><div class="hs a"></div><div class="hs c"></div><div class="hs b"></div>
  </div>

  <!-- SOCIAL CIRCLES -->
  <div id="socialCircles" style="display:flex;justify-content:center;gap:20px;padding:6px 0;">
    <div class="social-circle" id="sc-ig" onclick="showSocialAnalytics('instagram')" title="Instagram">
      <div class="sc-ring sc-ring1"></div>
      <div class="sc-ring sc-ring2"></div>
      <div class="sc-inner">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
        <div class="sc-lbl">IG</div>
      </div>
      <div class="sc-pulse"></div>
    </div>
    <div class="social-circle" id="sc-tt" onclick="showSocialAnalytics('tiktok')" title="TikTok">
      <div class="sc-ring sc-ring1"></div>
      <div class="sc-ring sc-ring2"></div>
      <div class="sc-inner">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.93a8.16 8.16 0 004.77 1.52V7.01a4.85 4.85 0 01-1-.32z"/></svg>
        <div class="sc-lbl">TT</div>
      </div>
      <div class="sc-pulse"></div>
    </div>
    <div class="social-circle" id="sc-pin" onclick="showSocialAnalytics('pinterest')" title="Pinterest">
      <div class="sc-ring sc-ring1"></div>
      <div class="sc-ring sc-ring2"></div>
      <div class="sc-inner">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
        <div class="sc-lbl">PIN</div>
      </div>
      <div class="sc-pulse"></div>
    </div>
  </div>

  <!-- BOTTOM STRIP -->
  <div id="botstrip">
    <div class="diag-bar">
      <div class="diag-item">
        <div class="di-lbl">AI CORE</div>
        <div class="di-val" style="color:#00ff88;">ONLINE</div>
        <div class="di-bar"><div class="di-fill" style="width:95%;background:#00ff88;color:#00ff88;"></div></div>
      </div>
      <div class="diag-item">
        <div class="di-lbl">VOICE SYS</div>
        <div class="di-val">LIVE</div>
        <div class="di-bar"><div class="di-fill" style="width:88%;background:var(--b2);color:var(--b2);"></div></div>
      </div>
      <div class="diag-item">
        <div class="di-lbl">CONTENT OPS</div>
        <div class="di-val" style="color:#ffaa00;">ARMED</div>
        <div class="di-bar"><div class="di-fill" style="width:75%;background:#ffaa00;color:#ffaa00;"></div></div>
      </div>
      <div class="diag-item">
        <div class="di-lbl">DAY PROG</div>
        <div class="di-val" id="sdaypct">0%</div>
        <div class="di-bar"><div id="sdayprog" class="di-fill" style="width:0%;background:var(--b2);"></div></div>
      </div>
    </div>
  </div>

</div>

<script>
// ─── AUDIO ENGINE ───
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;
function getACtx(){
  if(!actx){try{actx=new AudioCtx();}catch(e){}}
  if(actx&&actx.state==='suspended')actx.resume();
  return actx;
}

function playTone(freq,dur,type='sine',vol=0.15,delay=0){
  const ctx=getACtx();if(!ctx)return;
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.connect(g);g.connect(ctx.destination);
  o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime+delay);
  g.gain.setValueAtTime(0,ctx.currentTime+delay);
  g.gain.linearRampToValueAtTime(vol,ctx.currentTime+delay+0.01);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+dur);
  o.start(ctx.currentTime+delay);
  o.stop(ctx.currentTime+delay+dur+0.05);
}

function playNoise(dur,vol=0.05,delay=0){
  const ctx=getACtx();if(!ctx)return;
  const buf=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate);
  const data=buf.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);
  const src=ctx.createBufferSource();
  src.buffer=buf;
  const f=ctx.createBiquadFilter();
  f.type='bandpass';f.frequency.value=1200;f.Q.value=0.5;
  const g=ctx.createGain();
  g.gain.setValueAtTime(0,ctx.currentTime+delay);
  g.gain.linearRampToValueAtTime(vol,ctx.currentTime+delay+0.01);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+dur);
  src.connect(f);f.connect(g);g.connect(ctx.destination);
  src.start(ctx.currentTime+delay);src.stop(ctx.currentTime+delay+dur+0.05);
}

// BOOT BEEP SEQUENCE — like Jarvis powering up
function playBootSound(){
  const ctx=getACtx();if(!ctx)return;
  // Rising power-up sweep
  const o=ctx.createOscillator();const g=ctx.createGain();
  o.connect(g);g.connect(ctx.destination);
  o.type='sawtooth';
  o.frequency.setValueAtTime(80,ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.8);
  g.gain.setValueAtTime(0,ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.06,ctx.currentTime+0.1);
  g.gain.linearRampToValueAtTime(0.06,ctx.currentTime+0.7);
  g.gain.linearRampToValueAtTime(0,ctx.currentTime+0.9);
  o.start(ctx.currentTime);o.stop(ctx.currentTime+1);
  // Staggered beeps
  [0.3,0.5,0.65,0.75,0.82,0.88,0.93].forEach((t,i)=>{
    playTone(400+i*120,0.06,'square',0.08,t);
  });
  // Final confirmation chord
  [0.95,0.98,1.01].forEach((t,f,arr)=>{
    playTone([880,1100,1320][f],0.3,'sine',0.07,t);
  });
  // Noise bursts
  playNoise(0.04,0.04,0.3);
  playNoise(0.04,0.04,0.5);
  playNoise(0.08,0.06,0.92);
}

// BOOT LINE BEEP — for each line during boot
function playBootLineBeep(idx){
  const freqs=[440,480,520,460,500,540,420,490,510,470,530,450,480,440,520,460];
  const f=freqs[idx%freqs.length];
  playTone(f,0.04,'square',0.06);
  if(Math.random()>0.6)playNoise(0.02,0.03,0.01);
}

// SEND BEEP — when user sends message
function playSendBeep(){
  playTone(660,0.05,'square',0.08);
  playTone(880,0.08,'sine',0.06,0.06);
}

// RECEIVE BEEP — when HALO responds
function playReceiveBeep(){
  playTone(520,0.04,'square',0.07);
  playTone(780,0.04,'square',0.07,0.05);
  playTone(1040,0.12,'sine',0.06,0.1);
  playNoise(0.03,0.03,0.05);
}

// INTEL OPEN — when intel panel opens
function playIntelBeep(){
  [0,0.04,0.08,0.12,0.16].forEach((t,i)=>{
    playTone(400+i*80,0.04,'square',0.07,t);
  });
  playTone(800,0.2,'sine',0.05,0.2);
  playNoise(0.04,0.04,0.04);
  playNoise(0.04,0.04,0.12);
}

// WAKE WORD DETECTED
function playWakeBeep(){
  playTone(880,0.06,'square',0.1);
  playTone(1100,0.06,'square',0.1,0.07);
  playTone(1320,0.15,'sine',0.08,0.14);
}

// ERROR / CONNECTION FAILED
function playErrorBeep(){
  playTone(220,0.15,'sawtooth',0.08);
  playTone(180,0.15,'sawtooth',0.08,0.18);
}

// POST CONTENT QUEUED
function playSuccessBeep(){
  playTone(660,0.06,'sine',0.08);
  playTone(880,0.06,'sine',0.08,0.08);
  playTone(1100,0.15,'sine',0.08,0.16);
  playTone(1320,0.2,'sine',0.06,0.24);
}

// ─── BOOT SEQUENCE ───
const bootMsgs=[
  '> INITIALIZING HALO CORE SYSTEMS...',
  '> LOADING NEURAL INTELLIGENCE MATRIX...',
  '> CONNECTING TO ANTHROPIC AI ENGINE...',
  '> VOICE SYNTHESIS MODULE: ONLINE',
  '> ELEVENLABS BARNABY VOICE: LOADED',
  '> SCANNING THREAT ENVIRONMENT...',
  '> WEATHER FEED: LOS ANGELES CONNECTED',
  '> CONTENT AUTOMATION: ARMED',
  '> MAKE.COM WEBHOOK: ACTIVE',
  '> BUFFER CHANNELS: INSTAGRAM / TIKTOK',
  '> SYSTEM DIAGNOSTICS: ALL GREEN',
  '> STARK INDUSTRIES CLEARANCE: GRANTED',
  '> H.A.L.O. FULLY OPERATIONAL',
];
let bootIdx=0;
function runBoot(){
  const linesEl=document.getElementById('bootLines');
  const barEl=document.getElementById('bootBar');
  function showLine(){
    if(bootIdx>=bootMsgs.length){
      barEl.style.width='100%';
      setTimeout(()=>{
        document.getElementById('boot').classList.add('done');
        document.getElementById('halo').style.opacity='1';
        setTimeout(playBootSound, 200);
        renderTasks();renderRems();tick();loadWeather();
        setInterval(tick,1000);
        fetch('https://halo-server-d3h3.onrender.com').then(()=>{
          console.log('HALO server awake');
          if(checkKey())setTimeout(bootGreeting,800);
        }).catch(()=>{
          if(checkKey())setTimeout(bootGreeting,800);
        });
      },600);
      return;
    }
    const div=document.createElement('div');
    div.className='boot-line';
    div.textContent=bootMsgs[bootIdx];
    playBootLineBeep(bootIdx);
    linesEl.appendChild(div);
    requestAnimationFrame(()=>{div.classList.add('show');});
    barEl.style.width=Math.round((bootIdx/bootMsgs.length)*100)+'%';
    // keep only last 8 lines visible
    const lines=linesEl.querySelectorAll('.boot-line');
    if(lines.length>8)lines[0].remove();
    bootIdx++;
    setTimeout(showLine,180+Math.random()*120);
  }
  showLine();
}
setTimeout(runBoot,300);

// ─── CORE VARS ───
const SYSTEM=`You are HALO — Highly Advanced Logistics Operator. Calm, confident, authoritative AI. Like a brilliant composed intelligence officer. 1-2 sentence spoken responses max. Deep, precise, purposeful.

You manage an Omkeer clothing brand social media account. Omkeer is a luxury faith-driven streetwear brand. Tagline: "Not a team. A belief."

POSTING RULE: When user asks to post content to social media, Instagram, TikTok, or Pinterest, extract the description and image URL from their message and respond with a POST_CONTENT block.

Format for posting:
[SPOKEN]Short confirmation spoken reply.[/SPOKEN]
[POST_CONTENT]
DESCRIPTION: what the post is about
IMAGE_URL: the image URL if provided, or leave blank
PLATFORMS: Instagram, TikTok, Pinterest
[/POST_CONTENT]

INTEL RULE: When user asks for information to read/see include DISPLAY_INTEL block.
Format EXACTLY:
[SPOKEN]Short 1-2 sentence reply.[/SPOKEN]
[DISPLAY_INTEL]
TITLE: Short title
CONTENT:
<h3>Section</h3>
<p>Content here</p>
<ul><li>Point one</li></ul>
[/DISPLAY_INTEL]

Skip special blocks for: greetings, yes/no, time/weather, thanks. Never break character.`;

const WAKE_WORDS=['hey halo','hey hello','a halo','halo'];
let tasks=[{t:'Check morning emails',time:'9:00',done:false},{t:'Team standup',time:'10:00',done:false},{t:'Review project files',time:'2:00',done:false},{t:'Evening workout',time:'6:00',done:false}];
let rems=[{t:'Call dentist — reschedule',p:'hi'},{t:'Pay electricity bill',p:'hi'},{t:'Buy groceries',p:'md'},{t:'Read 20 minutes tonight',p:'lo'}];
let history=[],alwaysOn=false,wakeLoop=null,commandMode=false,waveInt=null,isSpeaking=false;
let API_KEY=localStorage.getItem('halo_api_key')||'';
const synth=window.speechSynthesis;

// ─── BAR RING ───
const barCanvas=document.getElementById('barCanvas');
const bctx=barCanvas.getContext('2d');
let barHeights=[],barTargets=[],barState='idle';
const BC=120;
for(let i=0;i<BC;i++){barHeights.push(2+Math.random()*3);barTargets.push(2+Math.random()*3);}
function resizeCanvas(){
  const r=document.getElementById('reactorOuter');
  if(!r)return;
  barCanvas.width=r.offsetWidth*devicePixelRatio;
  barCanvas.height=r.offsetHeight*devicePixelRatio;
  barCanvas.style.width=r.offsetWidth+'px';
  barCanvas.style.height=r.offsetHeight+'px';
  bctx.scale(devicePixelRatio,devicePixelRatio);
}
try{resizeCanvas();}catch(e){}
window.addEventListener('resize',()=>{try{resizeCanvas();}catch(e){}});
function drawBars(){
  const w=barCanvas.offsetWidth,h=barCanvas.offsetHeight;
  bctx.clearRect(0,0,w,h);
  const cx=w/2,cy=h/2,r=w*0.36;
  for(let i=0;i<BC;i++){
    const ang=(i/BC)*Math.PI*2;
    const bh=barHeights[i];
    const x1=cx+Math.cos(ang)*r,y1=cy+Math.sin(ang)*r;
    const x2=cx+Math.cos(ang)*(r+bh),y2=cy+Math.sin(ang)*(r+bh);
    const al=barState==='speaking'?0.9:barState==='listening'?0.75:0.38;
    const col=barState==='listening'?'0,255,136':'26,143,255';
    bctx.strokeStyle=`rgba(${col},${al})`;bctx.lineWidth=1.5;
    bctx.beginPath();bctx.moveTo(x1,y1);bctx.lineTo(x2,y2);bctx.stroke();
    bctx.strokeStyle=`rgba(${col},${al*0.25})`;bctx.lineWidth=3.5;
    bctx.beginPath();bctx.moveTo(x1,y1);bctx.lineTo(x2,y2);bctx.stroke();
  }
}
function updateBars(){
  const mh=barState==='speaking'?34:barState==='listening'?24:barState==='armed'?9:4;
  for(let i=0;i<BC;i++){if(Math.random()<0.15)barTargets[i]=2+Math.random()*mh;barHeights[i]+=(barTargets[i]-barHeights[i])*0.15;}
  drawBars();requestAnimationFrame(updateBars);
}
updateBars();

// ─── API KEY ───
function saveKey(){
  const v=document.getElementById('keyInp').value.trim();
  if(!v.startsWith('sk-')){alert('Invalid key');return;}
  API_KEY=v;localStorage.setItem('halo_api_key',v);
  document.getElementById('keyBanner').className='key-banner hidden';
  document.getElementById('apiStatus').textContent='SYSTEMS ONLINE';
  bootGreeting();
}
function checkKey(){
  if(API_KEY){document.getElementById('keyBanner').className='key-banner hidden';document.getElementById('apiStatus').textContent='SYSTEMS ONLINE';return true;}
  return false;
}

// ─── TASKS ───
function renderTasks(){
  document.getElementById('tlist').innerHTML=tasks.map((t,i)=>`<div class="trow${t.done?' done':''}" onclick="tog(${i})"><div class="tcheck">${t.done?'✓':''}</div><span class="tlbl">${t.t}</span><span class="ttime">${t.time}</span></div>`).join('');
  const d=tasks.filter(x=>x.done).length,n=tasks.length||1;
  document.getElementById('sdone').textContent=d+'/'+tasks.length;
  document.getElementById('sprog').style.width=Math.round(d/n*100)+'%';
  document.getElementById('hpend').textContent=tasks.filter(x=>!x.done).length+' PENDING';
}
function tog(i){tasks[i].done=!tasks[i].done;renderTasks();}
function addTask(){const v=document.getElementById('tinp').value.trim();if(!v)return;tasks.unshift({t:v,time:'',done:false});document.getElementById('tinp').value='';renderTasks();}
document.getElementById('tinp').addEventListener('keydown',e=>{if(e.key==='Enter')addTask();});

// ─── REMINDERS ───
function renderRems(){
  document.getElementById('rlist').innerHTML=rems.map(r=>`<div class="rrow"><div class="rbar b${r.p}"></div><span class="rtxt">${r.t}</span><span class="rtag tt${r.p}">${r.p==='hi'?'URGENT':r.p==='md'?'MEDIUM':'LOW'}</span></div>`).join('');
}
function addRem(){const v=document.getElementById('rinp').value.trim(),p=document.getElementById('rpri').value;if(!v)return;rems.unshift({t:v,p});document.getElementById('rinp').value='';renderRems();}
document.getElementById('rinp').addEventListener('keydown',e=>{if(e.key==='Enter')addRem();});

// ─── INTEL ───
function openIntel(title,html){
  playIntelBeep();
  document.getElementById('intelTitle').textContent=title.toUpperCase();
  document.getElementById('intelBody').innerHTML=html;
  document.getElementById('intelPanel').className='intel-panel visible';
}
function showIntelLoading(){
  document.getElementById('intelBody').innerHTML='<div class="intel-loading"><div class="intel-spin"></div><span>PROCESSING INTEL...</span></div>';
  document.getElementById('intelPanel').className='intel-panel visible';
}
function closeIntel(){document.getElementById('intelPanel').className='intel-panel';}

// ─── PARSE ───
function parseResponse(raw){
  const sm=raw.match(/\[SPOKEN\]([\s\S]*?)\[\/SPOKEN\]/);
  const im=raw.match(/\[DISPLAY_INTEL\]([\s\S]*?)\[\/DISPLAY_INTEL\]/);
  const pm=raw.match(/\[POST_CONTENT\]([\s\S]*?)\[\/POST_CONTENT\]/);
  let spoken=sm?sm[1].trim():raw.replace(/\[DISPLAY_INTEL\][\s\S]*?\[\/DISPLAY_INTEL\]/g,'').replace(/\[POST_CONTENT\][\s\S]*?\[\/POST_CONTENT\]/g,'').trim();
  let intel=null,postContent=null;
  if(im){const b=im[1];const tm=b.match(/TITLE:\s*(.+)/);const cm=b.match(/CONTENT:\s*([\s\S]*)/);intel={title:tm?tm[1].trim():'Intel',content:cm?cm[1].trim():b};}
  if(pm){const b=pm[1];const dm=b.match(/DESCRIPTION:\s*(.+)/);const iu=b.match(/IMAGE_URL:\s*(.+)/);const pl=b.match(/PLATFORMS:\s*(.+)/);postContent={description:dm?dm[1].trim():'',image_url:iu?iu[1].trim():'',platforms:pl?pl[1].trim():'Instagram, TikTok'};}
  return{spoken,intel,postContent};
}

// ─── CHAT ───
function addChat(role,text){
  const f=document.getElementById('chatFeed');
  const d=document.createElement('div');
  d.innerHTML=`<div class="msg-lbl">${role==='user'?'YOU':'HALO'}</div><div class="${role==='user'?'msg-u':'msg-h'}">${text}</div>`;
  f.appendChild(d);f.scrollTop=f.scrollHeight;
}

// ─── WAKE STATE ───
function setWakeState(s){
  const m={standby:'STANDBY',armed:'ARMED // "HEY HALO"',heard:'WAKE WORD DETECTED',listening:'LISTENING FOR COMMAND',speaking:'HALO RESPONDING'};
  document.getElementById('wakeDot').className='wake-dot '+(s==='standby'?'':s);
  document.getElementById('wakeTxt').textContent=m[s]||s;
  barState=s==='speaking'?'speaking':s==='listening'||s==='heard'?'listening':s==='armed'?'armed':'idle';
}

// ─── WAVEFORM ───
function animWave(on){
  clearInterval(waveInt);
  const bars=document.querySelectorAll('.wb');
  if(!on){bars.forEach(b=>{b.style.height='3px';b.classList.remove('active');});return;}
  bars.forEach(b=>b.classList.add('active'));
  waveInt=setInterval(()=>bars.forEach(b=>{b.style.height=Math.round(3+Math.random()*24)+'px';}),90);
}
function setRipple(on){
  document.getElementById('rip1').className='rip'+(on?' active':'');
  document.getElementById('rip2').className='rip2'+(on?' active':'');
}

// ─── SPEAK ───
let audioUnlocked=false,pendingGreeting=null;
function speakText(text,onDone){
  isSpeaking=true;setWakeState('speaking');animWave(true);setRipple(true);
  if(!audioUnlocked){isSpeaking=false;animWave(false);setRipple(false);if(alwaysOn){setWakeState('armed');startWakeLoop();}else setWakeState('standby');onDone&&onDone();return;}
  function trySpeak(n){
    fetch('https://halo-server-d3h3.onrender.com/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})})
    .then(r=>{if(!r.ok)throw new Error();return r.blob();})
    .then(blob=>{
      const url=URL.createObjectURL(blob);
      const audio=new Audio(url);
      audio.onended=()=>{isSpeaking=false;animWave(false);setRipple(false);URL.revokeObjectURL(url);if(alwaysOn){setWakeState('armed');startWakeLoop();}else setWakeState('standby');onDone&&onDone();};
      audio.onerror=()=>{isSpeaking=false;animWave(false);setRipple(false);if(alwaysOn){setWakeState('armed');startWakeLoop();}else setWakeState('standby');};
      const p=audio.play();if(p)p.catch(()=>setTimeout(()=>audio.play().catch(()=>{isSpeaking=false;animWave(false);setRipple(false);if(alwaysOn){setWakeState('armed');startWakeLoop();}else setWakeState('standby');}),500));
    }).catch(()=>{if(n>0)setTimeout(()=>trySpeak(n-1),3000);else{isSpeaking=false;animWave(false);setRipple(false);if(alwaysOn){setWakeState('armed');startWakeLoop();}else setWakeState('standby');onDone&&onDone();}});
  }
  trySpeak(3);
}

// ─── ASK HALO ───
async function askHalo(text){
  if(!API_KEY){addChat('halo','API key required. Please activate HALO.');return;}
  addChat('user',text);
  history.push({role:'user',content:text});
  // Check for social analytics commands
  const socialCmd=text.toLowerCase();
  if(socialCmd.includes('instagram')&&(socialCmd.includes('analytic')||socialCmd.includes('stat')||socialCmd.includes('show'))){
    showSocialAnalytics('instagram');addChat('halo','Pulling Instagram analytics now, Commander.');speakText('Pulling Instagram analytics now.');return;
  }
  if(socialCmd.includes('tiktok')&&(socialCmd.includes('analytic')||socialCmd.includes('stat')||socialCmd.includes('show'))){
    showSocialAnalytics('tiktok');addChat('halo','TikTok analytics on display.');speakText('TikTok analytics on display.');return;
  }
  if(socialCmd.includes('pinterest')&&(socialCmd.includes('analytic')||socialCmd.includes('stat')||socialCmd.includes('show'))){
    showSocialAnalytics('pinterest');addChat('halo','Pinterest analytics incoming.');speakText('Pinterest analytics incoming.');return;
  }
  const infoQ=/explain|what is|what are|how does|how do|tell me|show me|give me|describe|define|research|summarise|summarize|steps|tips|guide|info|information|display|who is|history|science|news|latest|top|best|list|compare|difference|why/i.test(text);
  if(infoQ)showIntelLoading();else setWakeState('speaking');
  try{
    const res=await fetch('https://halo-server-d3h3.onrender.com/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:SYSTEM,messages:history})});
    const data=await res.json();
    let raw=data.reply||'Systems nominal.';
    const{spoken,intel,postContent}=parseResponse(raw);
    history.push({role:'assistant',content:raw});
    playReceiveBeep();
    addChat('halo',spoken);
    if(intel)openIntel(intel.title,intel.content);else if(infoQ)closeIntel();
    if(postContent){
      fetch('https://halo-server-d3h3.onrender.com/post-content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(postContent)})
      .then(r=>r.json()).then(d=>{if(d.success){playSuccessBeep();addChat('halo','Content queued for deployment.');}else addChat('halo','Posting issue: '+d.error);})
      .catch(()=>addChat('halo','Could not reach posting service.'));
    }
    speakText(spoken);
  }catch(e){console.log('HALO error:',e);addChat('halo','System interference. Rerouting...');if(infoQ)closeIntel();}
}
function sendText(){const v=document.getElementById('textInp').value.trim();if(!v)return;document.getElementById('textInp').value='';playSendBeep();askHalo(v);}
document.getElementById('textInp').addEventListener('keydown',e=>{if(e.key==='Enter')sendText();});

// ─── WAKE WORD ───
function startWakeLoop(){
  if(!alwaysOn||isSpeaking)return;
  if(!('webkitSpeechRecognition' in window||'SpeechRecognition' in window))return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const r=new SR();wakeLoop=r;r.lang='en-US';r.interimResults=false;r.maxAlternatives=3;r.continuous=false;
  r.onresult=e=>{const res=Array.from(e.results).flatMap(x=>Array.from(x)).map(a=>a.transcript.toLowerCase().trim());if(res.some(t=>WAKE_WORDS.some(w=>t.includes(w)))&&!isSpeaking){playWakeBeep();setWakeState('heard');animWave(true);setTimeout(()=>startCommandListen(),300);}else if(alwaysOn&&!isSpeaking)setTimeout(()=>startWakeLoop(),200);};
  r.onerror=e=>{if(e.error==='not-allowed'){alwaysOn=false;updateToggle();return;}if(alwaysOn&&!isSpeaking)setTimeout(()=>startWakeLoop(),500);};
  r.onend=()=>{if(alwaysOn&&!commandMode&&!isSpeaking)setTimeout(()=>startWakeLoop(),200);};
  try{r.start();}catch(ex){if(alwaysOn&&!isSpeaking)setTimeout(()=>startWakeLoop(),600);}
}
function startCommandListen(){
  commandMode=true;setWakeState('listening');animWave(true);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const r=new SR();r.lang='en-US';r.interimResults=false;r.maxAlternatives=1;
  r.onresult=e=>{const t=e.results[0][0].transcript;commandMode=false;animWave(false);askHalo(t);};
  r.onerror=()=>{commandMode=false;animWave(false);if(alwaysOn&&!isSpeaking){setWakeState('armed');startWakeLoop();}};
  r.onend=()=>{if(commandMode){commandMode=false;animWave(false);if(alwaysOn&&!isSpeaking){setWakeState('armed');startWakeLoop();}}};
  try{r.start();}catch(ex){commandMode=false;if(alwaysOn&&!isSpeaking){setWakeState('armed');startWakeLoop();}}
}
function updateToggle(){const b=document.getElementById('alwaysOnBtn');b.textContent=alwaysOn?'On':'Off';b.className='tog-btn'+(alwaysOn?' on':'');}
function toggleAlwaysOn(){
  if(!('webkitSpeechRecognition' in window||'SpeechRecognition' in window)){addChat('halo','Voice recognition requires Chrome.');return;}
  alwaysOn=!alwaysOn;updateToggle();
  if(alwaysOn){setWakeState('armed');startWakeLoop();addChat('halo','Always-on armed. Say "Hey HALO" whenever you need me.');speakText('Always-on armed. Say Hey HALO whenever you need me.');}
  else{wakeLoop&&wakeLoop.abort&&wakeLoop.abort();wakeLoop=null;setWakeState('standby');synth.cancel();animWave(false);setRipple(false);isSpeaking=false;addChat('halo','Always-on deactivated.');}
}

// ─── CLOCK ───
function tick(){
  const n=new Date(),pad=x=>String(x).padStart(2,'0');
  document.getElementById('hclock').textContent=pad(n.getHours())+':'+pad(n.getMinutes())+':'+pad(n.getSeconds());
  const days=['SUN','MON','TUE','WED','THU','FRI','SAT'],months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  document.getElementById('hdate').textContent=days[n.getDay()]+' // '+months[n.getMonth()]+' '+n.getDate();
  const h=n.getHours();
  document.getElementById('hgreet').textContent=h<12?'GOOD MORNING':h<17?'GOOD AFTERNOON':'GOOD EVENING';
  const pct=Math.round(((h*60+n.getMinutes())/(24*60))*100);
  document.getElementById('sdaypct').textContent=pct+'%';
  const dp=document.getElementById('sdayprog');if(dp)dp.style.width=pct+'%';
}

// ─── WEATHER ───
async function loadWeather(){
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.05&longitude=-118.24&current_weather=true&temperature_unit=fahrenheit');
    const d=await r.json();
    const t=Math.round(d.current_weather.temperature),c=d.current_weather.weathercode;
    document.getElementById('wtemp').textContent=t+'°';
    document.getElementById('wdesc').textContent=c===0?'CLEAR':c<=2?'P.CLOUDY':c===3?'OVERCAST':c<=48?'FOGGY':c<=67?'RAIN':'STORM';
  }catch(e){}
}

// ─── VOICE ACTIVATE ───
function activateVoice(){
  audioUnlocked=true;
  playBootSound();
  const btn=document.getElementById('activateVoiceBtn');
  btn.textContent='▶ VOICE ACTIVATED';btn.style.borderColor='rgba(0,255,136,0.3)';btn.style.color='#00ff88';btn.disabled=true;
  const h=new Date().getHours();
  const g=`${h<12?'Good morning':'Good afternoon'}. Voice interface activated. All systems are online and ready.`;
  fetch('https://halo-server-d3h3.onrender.com/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:g})})
  .then(r=>r.blob()).then(blob=>{const url=URL.createObjectURL(blob);const a=new Audio(url);a.play().then(()=>{addChat('halo',g);}).catch(e=>console.log(e));}).catch(e=>console.log(e));
}

function bootGreeting(){
  const h=new Date().getHours();
  const intro=`${h<12?'Good morning':'Good afternoon'}. HALO systems are fully online. How may I assist you?`;
  addChat('halo',intro);
  if(audioUnlocked)speakText(intro);else pendingGreeting=intro;
}

// ─── SOCIAL ANALYTICS ───
const socialData = {
  instagram: {
    name: 'INSTAGRAM // @OMKEER.WORLD',
    color: '#e1306c',
    stats: [
      {label:'FOLLOWERS',value:'–',bar:0},
      {label:'POSTS',value:'–',bar:0},
      {label:'AVG ENGAGEMENT',value:'–',bar:0},
      {label:'REACH THIS WEEK',value:'–',bar:0},
    ],
    cards: [
      {val:'–',lbl:'PROFILE VISITS'},
      {val:'–',lbl:'LINK CLICKS'},
      {val:'8PM',lbl:'BEST POST TIME'},
      {val:'HIGH',lbl:'FAITH CONTENT'},
    ],
    tips: 'Connect Instagram API to see real-time analytics. Best posting time for your audience: 8PM daily.'
  },
  tiktok: {
    name: 'TIKTOK // @OMKEERWOLD',
    color: '#69c9d0',
    stats: [
      {label:'FOLLOWERS',value:'–',bar:0},
      {label:'TOTAL LIKES',value:'–',bar:0},
      {label:'VIDEO VIEWS',value:'–',bar:0},
      {label:'SHARES',value:'–',bar:0},
    ],
    cards: [
      {val:'–',lbl:'PROFILE VIEWS'},
      {val:'–',lbl:'COMMENTS'},
      {val:'7PM',lbl:'BEST POST TIME'},
      {val:'HIGH',lbl:'STREETWEAR'},
    ],
    tips: 'Connect TikTok API to see real-time analytics. Reels and short clips perform best for streetwear.'
  },
  pinterest: {
    name: 'PINTEREST // @OMKEERWOLD',
    color: '#e60023',
    stats: [
      {label:'MONTHLY VIEWS',value:'–',bar:0},
      {label:'FOLLOWERS',value:'–',bar:0},
      {label:'SAVES',value:'–',bar:0},
      {label:'CLICKS',value:'–',bar:0},
    ],
    cards: [
      {val:'–',lbl:'IMPRESSIONS'},
      {val:'–',lbl:'ENGAGEMENTS'},
      {val:'6PM',lbl:'BEST POST TIME'},
      {val:'HIGH',lbl:'FASHION'},
    ],
    tips: 'Pinterest drives high purchase intent. Faith and luxury fashion content performs well here.'
  }
};

function showSocialAnalytics(platform){
  playIntelBeep();
  const d=socialData[platform];
  const overlay=document.getElementById('socialOverlay');
  const panel=document.getElementById('socialPanel');
  
  // Position panel near the circle
  const circles={instagram:'sc-ig',tiktok:'sc-tt',pinterest:'sc-pin'};
  const circleEl=document.getElementById(circles[platform]);
  const rect=circleEl.getBoundingClientRect();
  const panelW=300;
  let left=rect.left+rect.width/2-panelW/2;
  let top=rect.top-320;
  if(left<10)left=10;
  if(left+panelW>window.innerWidth-10)left=window.innerWidth-panelW-10;
  if(top<10)top=rect.bottom+10;
  panel.style.left=left+'px';
  panel.style.top=top+'px';
  panel.style.width=panelW+'px';
  
  document.getElementById('socialPanelTitle').textContent=d.name;
  
  // Build HTML with animation delays
  let html=`<div style="margin-bottom:10px;">`;
  d.stats.forEach((s,i)=>{
    html+=`<div class="stat-line" style="animation-delay:${i*0.08}s">
      <div class="stat-icon" style="background:${d.color};box-shadow:0 0 6px ${d.color};"></div>
      <span class="stat-label">${s.label}</span>
      <span class="stat-value" style="color:${d.color};text-shadow:0 0 8px ${d.color}44;">${s.value}</span>
    </div>`;
  });
  html+=`</div><div class="analytics-grid">`;
  d.cards.forEach((c,i)=>{
    html+=`<div class="analytics-card" style="animation-delay:${0.3+i*0.08}s;border-color:${d.color}22;">
      <div class="ac-val" style="color:${d.color};text-shadow:0 0 10px ${d.color}44;">${c.val}</div>
      <div class="ac-lbl">${c.lbl}</div>
    </div>`;
  });
  html+=`</div><div class="connect-notice">⚡ ${d.tips}</div>`;
  html+=`<div style="margin-top:10px;display:flex;gap:6px;">
    <button onclick="askHalo('Give me content strategy advice for ${platform} for Omkeer brand')" style="flex:1;background:rgba(26,143,255,0.06);border:1px solid rgba(26,143,255,0.2);color:var(--b2);font-family:'Share Tech Mono',monospace;font-size:7px;padding:7px;border-radius:2px;cursor:pointer;letter-spacing:1px;">ASK HALO STRATEGY ↗</button>
    <button onclick="closeSocialPanel()" style="background:rgba(26,143,255,0.04);border:1px solid rgba(26,143,255,0.12);color:rgba(26,143,255,0.35);font-family:'Share Tech Mono',monospace;font-size:7px;padding:7px;border-radius:2px;cursor:pointer;letter-spacing:1px;">CLOSE</button>
  </div>`;
  
  document.getElementById('socialPanelBody').innerHTML=html;
  overlay.style.display='block';
  overlay.style.pointerEvents='all';
  
  // Draw connecting line animation
  drawConnectorLine(circleEl, panel);
}

function closeSocialPanel(){
  document.getElementById('socialOverlay').style.display='none';
  const line=document.getElementById('socialConnectorLine');
  if(line)line.remove();
}

function drawConnectorLine(fromEl, toEl){
  const existing=document.getElementById('socialConnectorLine');
  if(existing)existing.remove();
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id='socialConnectorLine';
  svg.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:4999;width:100%;height:100%;';
  const fromRect=fromEl.getBoundingClientRect();
  const toRect=toEl.getBoundingClientRect();
  const x1=fromRect.left+fromRect.width/2;
  const y1=fromRect.top;
  const x2=toRect.left+toRect.width/2;
  const y2=toRect.bottom;
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  const d=`M ${x1} ${y1} C ${x1} ${(y1+y2)/2}, ${x2} ${(y1+y2)/2}, ${x2} ${y2}`;
  path.setAttribute('d',d);
  path.setAttribute('stroke','rgba(26,143,255,0.3)');
  path.setAttribute('stroke-width','1');
  path.setAttribute('fill','none');
  path.setAttribute('stroke-dasharray','4 4');
  path.style.animation='dash 1s linear infinite';
  svg.appendChild(path);
  document.body.appendChild(svg);
}

// Close panel when clicking outside
document.addEventListener('click',e=>{
  const overlay=document.getElementById('socialOverlay');
  const panel=document.getElementById('socialPanel');
  if(overlay.style.display==='block' && !panel.contains(e.target) && !e.target.closest('.social-circle')){
    closeSocialPanel();
  }
});

// HALO command to show analytics
const origAskHalo = askHalo;

// ─── AUDIO UNLOCK ───
if(synth.onvoiceschanged!==undefined)synth.onvoiceschanged=()=>synth.getVoices();
function unlockAudio(){
  if(audioUnlocked)return;audioUnlocked=true;
  try{const ctx=new(window.AudioContext||window.webkitAudioContext)();ctx.resume();}catch(e){}
  if(pendingGreeting){speakText(pendingGreeting);pendingGreeting=null;}
}
document.addEventListener('click',unlockAudio,{once:false});
document.addEventListener('keydown',unlockAudio,{once:false});
</script>
</body>
</html>
