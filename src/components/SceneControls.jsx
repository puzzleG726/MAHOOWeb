import { useState, useSyncExternalStore } from 'react';
import { getSceneSettings, subscribeSceneSettings, updateSceneSettings, resetSceneSettings } from '../sceneSettings.js';
import './SceneControls.css';
const fields = [
  ['density','颗粒密度',600,6000,100],['particleSize','颗粒大小',.35,2,.05],
  ['helixWidth','螺旋宽度',.4,5,.1],['helixPitch','螺旋节距',20,90,1],
  ['depth','前后纵深',.5,7,.1],['scatter','碎片散布',.1,4,.05],
  ['gradientStrength','渐变亮度',.2,1.6,.05],['pointerStrength','鼠标位移',0,2,.05],['iridescence','虹彩强度',0,.8,.02],['grain','背景纹理',0,.04,.002],['particleMotion','悬浮幅度',0,1.5,.05],
];
export default function SceneControls(){
  const settings=useSyncExternalStore(subscribeSceneSettings,getSceneSettings);
  const [open,setOpen]=useState(()=>innerWidth>768),[copied,setCopied]=useState(false);
  return <aside className={`sceneControls ${open?'is-open':''}`} aria-label="场景参数调整">
    <button className="sceneControlsToggle" type="button" onClick={()=>setOpen(!open)} aria-expanded={open}>场景参数 <span>{open?'−':'＋'}</span></button>
    {open&&<div className="sceneControlsBody">
      {fields.map(([key,label,min,max,step])=><label className="sceneControl" key={key}><span>{label}<output>{Number(settings[key].toFixed(key === "grain" ? 3 : 2))}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={settings[key]} onChange={event=>updateSceneSettings({[key]:Number(event.target.value)})}/></label>)}
      <div className="sceneControlsActions"><button type="button" onClick={resetSceneSettings}>恢复默认</button><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(JSON.stringify(settings,null,2));setCopied(true);}catch{setCopied(false);}}}>{copied?'已复制':'复制参数'}</button></div>
      <p>仅开发预览显示 · 调整自动保存</p>
    </div>}
  </aside>;
}
