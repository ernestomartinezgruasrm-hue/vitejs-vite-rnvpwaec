import { useState, useEffect } from "react";

const DRIVE_MCP_URL = "https://gdrive.mcp.claude.com/mcp";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const ASESORES = ["Jacobo Cantú", "Leo Cera", "Ernesto"];

const C = {
  black: "#0a0a0a", dark: "#111", card: "#151515",
  green: "#1a7a2e", bright: "#22a83e", glow: "#1a7a2e44",
  pale: "#0d2010", border: "#232323", gray: "#666",
  silver: "#aaa", white: "#f0f0f0",
};

const fmt = (v) => (parseFloat(v)||0).toLocaleString("es-MX",{style:"currency",currency:"MXN"});
const today = () => new Date().toISOString().split("T")[0];
const newItem = () => ({unidad:"",cantidad:"",pu:"",importe:""});
const newForm = (folio="") => ({folio,fecha:today(),empresa:"",cliente:"",correo:"",celular:"",asesor:"",celularAsesor:"",concepto:"",items:Array(5).fill(null).map(newItem)});
const calcTotal = (items) => items.reduce((s,i)=>s+(parseFloat(i.importe)||0),0);
const genFolio = (list) => `RM-${new Date().getFullYear()}-${String(list.length+1).padStart(4,"0")}`;

// PDF HTML
// PDF HTML
function buildPDF(q) {
  const rows = q.items.filter(i=>i.unidad||i.cantidad||i.pu);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=800"><title>${q.folio}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{font-family:'Barlow Condensed',Arial,sans-serif;background:#fff;color:#111;font-size:15px}
.hdr{background:#111;color:#fff;padding:16px 28px;display:flex;justify-content:space-between;align-items:center}
.brand{font-size:26px;font-weight:800;letter-spacing:2px}.brand-sub{font-size:12px;color:#1a7a2e;letter-spacing:3px}
.folio-box{background:#1a7a2e;padding:10px 22px;text-align:center}.folio-lbl{font-size:11px;letter-spacing:2px;color:#b0f0b8}.folio-val{font-size:24px;font-weight:800;letter-spacing:2px}
.title{background:#1a7a2e;color:#fff;text-align:center;padding:12px;font-size:20px;font-weight:800;letter-spacing:4px}
.body{padding:24px 28px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 32px;margin-bottom:24px}
.lbl{font-size:11px;font-weight:700;letter-spacing:2px;color:#666;text-transform:uppercase;display:block}.val{font-size:16px;font-weight:700}
.cbox{background:#e8f5eb;border-left:4px solid #1a7a2e;padding:12px 16px;margin-bottom:24px;font-size:15px;line-height:1.6}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th{background:#111;color:#fff;padding:10px 12px;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-align:left}
th.r{text-align:right;background:#1a7a2e}td{padding:10px 12px;border-bottom:1px solid #ddd;font-size:15px}td.r{text-align:right;font-weight:700;color:#1a7a2e}
tr:nth-child(even) td{background:#f8f8f8}
.total{display:flex;justify-content:flex-end;gap:24px;align-items:center;background:#111;color:#fff;padding:16px 20px}
.tl{font-size:14px;letter-spacing:3px;color:#888}.tv{font-size:30px;font-weight:800;color:#22a83e}
.footer{margin-top:36px;padding-top:16px;border-top:3px solid #1a7a2e;display:flex;justify-content:space-between;font-size:12px;color:#888}
.sig{text-align:center}.sig-line{border-top:1px solid #999;width:200px;margin:40px auto 6px}
@media print{@page{margin:0.5in}}</style></head><body>
<div class="hdr"><div><div class="brand">GRÚAS &amp; RIGGING RM</div><div class="brand-sub">AG INDUSTRIAL RM S DE R.L. DE C.V.</div></div>
<div class="folio-box"><div class="folio-lbl">FOLIO</div><div class="folio-val">${q.folio}</div></div></div>
<div class="title">COTIZACIÓN DE SERVICIO</div>
<div class="body">
<div class="grid">
<div><span class="lbl">Empresa</span><span class="val">${q.empresa}</span></div>
<div><span class="lbl">Fecha</span><span class="val">${q.fecha}</span></div>
<div><span class="lbl">Cliente</span><span class="val">${q.cliente}</span></div>
<div><span class="lbl">Asesor</span><span class="val">${q.asesor}</span></div>
<div><span class="lbl">Correo</span><span class="val">${q.correo||"—"}</span></div>
<div><span class="lbl">Cel. Asesor</span><span class="val">${q.celularAsesor||"—"}</span></div>
<div><span class="lbl">Celular Cliente</span><span class="val">${q.celular||"—"}</span></div>
</div>
${q.concepto?`<div class="cbox"><strong>Concepto:</strong> ${q.concepto}</div>`:""}
<table><thead><tr><th>Unidad</th><th>Cantidad</th><th>P.U.</th><th class="r">Importe</th></tr></thead>
<tbody>${rows.map(r=>`<tr><td>${r.unidad}</td><td>${r.cantidad}</td><td>${r.pu?fmt(r.pu):"—"}</td><td class="r">${r.importe?fmt(r.importe):"—"}</td></tr>`).join("")}</tbody></table>
<div class="total"><span class="tl">TOTAL</span><span class="tv">${fmt(q.total)}</span></div>
<div style="margin-top:32px"><div class="sig"><div class="sig-line"></div><div>${q.asesor}</div><div style="font-size:11px;color:#888;letter-spacing:1px">ASESOR COMERCIAL</div></div></div>
<div class="footer"><span>Carr. Federal Chihuahua-Aldama Km 6.5 | TEL. (614) 541-0888</span><span>Col. Valle de Chihuahua, CP 31385, Chihuahua, México</span></div>
</div></body></html>`;
}

function buildWA(q) {
  const rows = q.items.filter(i=>i.importe).map(i=>`  • ${i.unidad} x${i.cantidad} → ${fmt(i.importe)}`).join("\n");
  return `🏗️ *COTIZACIÓN GRÚAS & RIGGING RM*\n━━━━━━━━━━━━━━━━━━━━\n📋 *Folio:* ${q.folio}\n🏢 *Empresa:* ${q.empresa}\n👤 *Contacto:* ${q.cliente}\n📅 *Fecha:* ${q.fecha}\n${q.concepto?`\n📝 *Concepto:*\n${q.concepto}\n`:""}\n${rows?`💰 *Partidas:*\n${rows}\n`:""}\n━━━━━━━━━━━━━━━━━━━━\n💵 *TOTAL: ${fmt(q.total)}*\n\n_Asesor: ${q.asesor}${q.celularAsesor?" | "+q.celularAsesor:""}_\n_TEL. (614) 541-0888_`;
}

async function uploadToDrive(quote, folderId) {
  const content = `COTIZACIÓN DE SERVICIO - ${quote.folio}
================================
Fecha:    ${quote.fecha}
Empresa:  ${quote.empresa}
Cliente:  ${quote.cliente}
Correo:   ${quote.correo||"—"}
Celular:  ${quote.celular||"—"}
Asesor:   ${quote.asesor}

CONCEPTO:
${quote.concepto||"(sin descripción)"}

PARTIDAS:
${quote.items.filter(i=>i.unidad).map(i=>`  ${i.unidad.padEnd(20)} Cant: ${String(i.cantidad).padStart(4)}   P.U.: ${String(i.pu).padStart(10)}   Importe: $${i.importe}`).join("\n")}

TOTAL: ${fmt(quote.total)}

================================
AG Industrial RM S de R.L. de C.V.
Carr. Federal Chihuahua-Aldama Km 6.5
TEL. (614) 541-0888`;

  const resp = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:CLAUDE_MODEL, max_tokens:1000,
      messages:[{role:"user",content:`Using Google Drive, create a new text file named "${quote.folio} - ${quote.empresa}.txt" inside the folder with ID "${folderId}". The file content should be exactly:\n\n${content}\n\nConfirm with the file name once created.`}],
      mcp_servers:[{type:"url",url:DRIVE_MCP_URL,name:"google-drive"}]
    })
  });
  if(!resp.ok) throw new Error(`${resp.status}`);
  const data = await resp.json();
  return data.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"Guardado en Drive ✓";
}

// Styles
const S = {
  app:{background:C.black,minHeight:"100vh",fontFamily:"'Barlow Condensed','Oswald',sans-serif",color:C.white},
  hdr:{background:`linear-gradient(160deg,#0b0b0b 55%,${C.pale})`,borderBottom:`3px solid ${C.green}`,padding:"15px 26px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  brandWrap:{display:"flex",alignItems:"center",gap:12},
  brandIcon:{width:42,height:42,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0},
  brandName:{fontSize:21,fontWeight:800,letterSpacing:2,lineHeight:1.1},
  brandSub:{fontSize:10,color:C.green,letterSpacing:4,textTransform:"uppercase"},
  nav:{display:"flex",gap:6},
  nb:(a)=>({background:a?C.green:"transparent",border:`1px solid ${a?C.green:C.border}`,color:C.white,padding:"7px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}),
  wrap:{maxWidth:920,margin:"0 auto",padding:"26px 18px"},
  card:{background:C.card,border:`1px solid ${C.border}`,padding:"22px 26px",marginBottom:15},
  gcard:{background:C.pale,border:`1px solid ${C.green}`,padding:"22px 26px",marginBottom:15},
  sec:{fontSize:11,fontWeight:700,letterSpacing:3,color:C.green,textTransform:"uppercase",marginBottom:13,paddingBottom:7,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"},
  g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13},
  g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:13},
  lbl:{fontSize:10,fontWeight:700,letterSpacing:2,color:C.gray,textTransform:"uppercase",display:"block",marginBottom:4},
  inp:{background:"#171717",border:`1px solid ${C.border}`,color:C.white,padding:"9px 10px",fontFamily:"inherit",fontSize:14,outline:"none",width:"100%",boxSizing:"border-box"},
  sel:{background:"#171717",border:`1px solid ${C.border}`,color:C.white,padding:"9px 10px",fontFamily:"inherit",fontSize:14,outline:"none",width:"100%",cursor:"pointer"},
  txa:{background:"#171717",border:`1px solid ${C.border}`,color:C.white,padding:"9px 10px",fontFamily:"inherit",fontSize:14,outline:"none",width:"100%",resize:"vertical",minHeight:80,boxSizing:"border-box"},
  ci:{background:"transparent",border:"none",borderBottom:`1px solid #282828`,color:C.white,padding:"7px 5px",fontFamily:"inherit",fontSize:13,width:"100%",outline:"none"},
  th:{background:C.black,color:C.white,padding:"8px 9px",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",textAlign:"left",borderBottom:`2px solid ${C.green}`},
  thR:{background:C.green,color:C.white,padding:"8px 9px",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",textAlign:"right",borderBottom:`2px solid ${C.green}`},
  td:{padding:"3px",borderBottom:`1px solid ${C.border}`},
  tdR:{padding:"3px 8px",borderBottom:`1px solid ${C.border}`,textAlign:"right",color:C.bright,fontWeight:700},
  tbar:{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:18,background:C.black,border:`1px solid ${C.green}`,padding:"11px 14px",marginTop:9},
  btnP:{background:C.green,border:"none",color:C.white,padding:"12px 30px",fontFamily:"inherit",fontSize:13,fontWeight:800,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"},
  btnS:{background:"transparent",border:`1px solid ${C.border}`,color:C.silver,padding:"11px 18px",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"},
  btnA:(col)=>({background:col+"18",border:`1px solid ${col}`,color:col,padding:"8px 16px",fontFamily:"inherit",fontSize:12,fontWeight:800,letterSpacing:1,cursor:"pointer",textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:5}),
  btnSm:(col=C.green)=>({background:"transparent",border:`1px solid ${col}`,color:col,padding:"4px 11px",fontFamily:"inherit",fontSize:11,fontWeight:700,letterSpacing:1,cursor:"pointer",textTransform:"uppercase"}),
  badge:(col)=>({background:col+"20",border:`1px solid ${col}`,color:col,padding:"2px 8px",fontSize:11,fontWeight:700,letterSpacing:1,display:"inline-block"}),
  folio:{background:"#0a1f0d",border:`1px solid ${C.green}`,padding:"8px 13px",color:C.green,fontWeight:800,fontSize:16,letterSpacing:3,fontFamily:"monospace"},
  overlay:{position:"fixed",inset:0,background:"#000c",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center"},
  modal:{background:"#141414",border:`1px solid ${C.green}`,padding:30,width:"min(510px,94vw)",maxHeight:"88vh",overflowY:"auto"},
  toast:{position:"fixed",bottom:26,right:26,background:C.green,color:C.white,padding:"11px 22px",fontFamily:"inherit",fontWeight:800,fontSize:13,letterSpacing:1,zIndex:9999,boxShadow:`0 4px 18px ${C.green}88`,maxWidth:340},
  listRow:{display:"grid",gridTemplateColumns:"110px 1fr 120px 130px 80px 60px",alignItems:"center",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background .1s"},
  cell:{padding:"11px 13px",fontSize:13},
};

const F = ({label,children}) => (
  <div style={{display:"flex",flexDirection:"column",marginBottom:2}}>
    <label style={S.lbl}>{label}</label>
    {children}
  </div>
);

// ── Settings Modal ─────────────────────────────────────────────────────────
function SettingsModal({settings,onSave,onClose}) {
  const [cfg,setCfg] = useState(settings||{});
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={{fontSize:15,fontWeight:800,letterSpacing:2,marginBottom:5}}>⚙️ CONFIGURACIÓN GOOGLE DRIVE</div>
        <div style={{fontSize:12,color:C.gray,marginBottom:20,lineHeight:1.7}}>
          Pega el <strong style={{color:C.silver}}>ID de la carpeta</strong> de cada vendedor en Google Drive.<br/>
          <span style={{fontSize:11,background:"#0a180c",color:"#88cc99",padding:"3px 8px",display:"inline-block",marginTop:4,fontFamily:"monospace"}}>
            drive.google.com/drive/folders/<u>ESTE_ES_EL_ID</u>
          </span>
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,display:"flex",flexDirection:"column",gap:13}}>
          {ASESORES.map(a=>(
            <F key={a} label={`📁 Carpeta de ${a}`}>
              <input style={S.inp} placeholder="1BxKz9abc...XYZfolder" value={cfg[a]||""} onChange={e=>setCfg(p=>({...p,[a]:e.target.value}))}/>
            </F>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:22}}>
          <button style={S.btnS} onClick={onClose}>Cancelar</button>
          <button style={S.btnP} onClick={()=>{onSave(cfg);onClose();}}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ── Quote Form ─────────────────────────────────────────────────────────────
function QuoteForm({init,onSave,onCancel}) {
  const [f,setF] = useState(init);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const setRow=(i,k,v)=>{
    const items=f.items.map((it,x)=>{
      if(x!==i)return it;
      const u={...it,[k]:v};
      if(k==="cantidad"||k==="pu"){
        const q=parseFloat(k==="cantidad"?v:u.cantidad)||0;
        const p=parseFloat(k==="pu"?v:u.pu)||0;
        u.importe=q*p?(q*p).toFixed(2):"";
      }
      return u;
    });
    setF(p=>({...p,items}));
  };
  const total=calcTotal(f.items);
  const inp=(k,ph="")=>({style:S.inp,value:f[k],placeholder:ph,onChange:e=>set(k,e.target.value)});
  return (
    <div>
      <div style={S.card}>
        <div style={S.sec}><span>Datos de la Cotización</span></div>
        <div style={{...S.g3,marginBottom:13}}>
          <F label="Folio"><div style={S.folio}>{f.folio}</div></F>
          <F label="Fecha"><input type="date" {...inp("fecha")}/></F>
          <F label="Asesor">
            <select style={S.sel} value={f.asesor} onChange={e=>set("asesor",e.target.value)}>
              <option value="">— Seleccionar —</option>
              {ASESORES.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </F>
        </div>
        <div style={S.g2}>
          <F label="Celular del Asesor"><input {...inp("celularAsesor","614 000 0000")}/></F>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.sec}><span>Datos del Cliente</span></div>
        <div style={{...S.g2,marginBottom:13}}>
          <F label="Empresa"><input {...inp("empresa","Nombre de la empresa")}/></F>
          <F label="Cliente (Contacto)"><input {...inp("cliente","Nombre del contacto")}/></F>
        </div>
        <div style={S.g2}>
          <F label="Correo"><input {...inp("correo","correo@empresa.com")}/></F>
          <F label="Celular"><input {...inp("celular","614 000 0000")}/></F>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.sec}><span>Concepto del Servicio</span></div>
        <textarea style={S.txa} value={f.concepto} rows={4} placeholder="Tipo de maniobra, equipo requerido, lugar, condiciones especiales..." onChange={e=>set("concepto",e.target.value)}/>
      </div>
      <div style={S.card}>
        <div style={S.sec}>
          <span>Partidas del Servicio</span>
          <button style={S.btnSm()} onClick={()=>setF(p=>({...p,items:[...p.items,newItem()]}))}>+ Agregar fila</button>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={S.th}>Unidad</th><th style={S.th}>Cantidad</th>
            <th style={S.th}>P.U.</th><th style={S.thR}>Importe</th>
            <th style={{...S.th,width:32}}></th>
          </tr></thead>
          <tbody>
            {f.items.map((it,i)=>(
              <tr key={i}>
                <td style={S.td}><input style={S.ci} value={it.unidad} placeholder="Ej: Servicio, Hr, Día" onChange={e=>setRow(i,"unidad",e.target.value)}/></td>
                <td style={S.td}><input style={{...S.ci,width:72}} type="number" min="0" value={it.cantidad} placeholder="0" onChange={e=>setRow(i,"cantidad",e.target.value)}/></td>
                <td style={S.td}><input style={{...S.ci,width:110}} type="number" min="0" value={it.pu} placeholder="$0.00" onChange={e=>setRow(i,"pu",e.target.value)}/></td>
                <td style={S.tdR}>{it.importe?fmt(it.importe):"—"}</td>
                <td style={{...S.td,textAlign:"center"}}>
                  {f.items.length>1&&<button style={{background:"none",border:"none",color:"#cc3333",cursor:"pointer",fontSize:18,lineHeight:1}} onClick={()=>setF(p=>({...p,items:p.items.filter((_,x)=>x!==i)}))}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={S.tbar}>
          <span style={{fontSize:11,letterSpacing:3,color:C.gray}}>TOTAL</span>
          <span style={{fontSize:26,fontWeight:800,color:C.green}}>{fmt(total)}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
        <button style={S.btnS} onClick={onCancel}>Cancelar</button>
        <button style={S.btnP} onClick={()=>{
          if(!f.empresa||!f.asesor){alert("Llena Empresa y Asesor antes de guardar.");return;}
          onSave({...f,total});
        }}>💾 Guardar Cotización</button>
      </div>
    </div>
  );
}

// ── Detail ─────────────────────────────────────────────────────────────────
function QuoteDetail({q,driveCfg,onBack,onDelete}) {
  const [driveState,setDriveState]=useState(null);
  const [driveMsg,setDriveMsg]=useState("");
  const folderId=driveCfg?.[q.asesor];
  const rows=q.items.filter(i=>i.unidad||i.cantidad||i.pu);

  const handlePDF=()=>{const w=window.open("","_blank");w.document.write(buildPDF(q));w.document.close();setTimeout(()=>w.print(),600);};
  const handleWA=()=>window.open(`https://wa.me/?text=${encodeURIComponent(buildWA(q))}`,"_blank");
  const handleDrive=async()=>{
    if(!folderId){alert(`Sin carpeta de Drive para ${q.asesor}. Ve a ⚙️ Configuración.`);return;}
    setDriveState("loading");setDriveMsg("Subiendo a Google Drive...");
    try{
      const res=await uploadToDrive(q,folderId);
      setDriveState("ok");setDriveMsg(res.substring(0,140)||"Guardado en Drive ✓");
    }catch(e){
      setDriveState("err");setDriveMsg("Error al subir. Verifica la conexión de Google Drive y el ID de carpeta.");
    }
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <button style={S.btnS} onClick={onBack}>← Volver</button>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button style={S.btnA("#2196f3")} onClick={handlePDF}>📄 PDF</button>
          <button style={S.btnA("#25d366")} onClick={handleWA}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.894c-.242.685-.971 1.254-1.733 1.416-.45.097-.978.175-2.84-.61-1.964-.822-3.63-2.302-4.775-3.896-.561-.782-1.41-2.082-1.41-3.964 0-1.66.866-2.476 1.183-2.807.29-.304.634-.38.845-.38h.604c.197 0 .467.074.731.573.284.537.96 2.345.957 2.517-.003.173-.092.391-.185.548-.094.157-.186.246-.28.37-.093.124-.186.26-.079.483.107.224.477.785.981 1.271.674.641 1.243.84 1.417.933.174.094.277.079.38-.047.103-.126.44-.514.557-.69.117-.176.234-.146.394-.088.161.058 1.022.482 1.197.57.176.088.293.131.336.204.044.073.044.422-.198 1.105z"/></svg>
            WhatsApp
          </button>
          <button style={S.btnA(folderId?C.green:C.gray)} onClick={handleDrive} disabled={driveState==="loading"}>
            {driveState==="loading"?"⏳":"📂"} {folderId?"Guardar en Drive":"Drive sin config"}
          </button>
          <button style={S.btnA("#cc3333")} onClick={()=>{if(confirm("¿Eliminar esta cotización?"))onDelete(q.folio);}}>🗑</button>
        </div>
      </div>

      {driveState&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",marginBottom:12,background:driveState==="ok"?"#0a2010":driveState==="err"?"#1a0808":"#0d1520",border:`1px solid ${driveState==="ok"?C.green:driveState==="err"?"#cc3333":"#336"}`,fontSize:12,color:driveState==="ok"?C.bright:driveState==="err"?"#ff7777":"#88aaff",fontWeight:700,cursor:"pointer"}} onClick={()=>setDriveState(null)}>
          {driveState==="ok"?"✓":driveState==="err"?"✗":"⏳"} {driveMsg}
          <span style={{marginLeft:"auto",opacity:.5}}>×</span>
        </div>
      )}
      {!folderId&&(
        <div style={{fontSize:11,color:"#ff8866",background:"#1a0808",border:"1px solid #661111",padding:"6px 12px",marginBottom:12,fontWeight:700}}>
          ⚠️ Sin carpeta de Drive para <strong>{q.asesor}</strong> — configúrala en ⚙️
        </div>
      )}

      <div style={{...S.gcard,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,alignItems:"center"}}>
        <div><div style={S.lbl}>Folio</div><div style={{fontSize:24,fontWeight:800,color:C.green,letterSpacing:3}}>{q.folio}</div></div>
        <div style={{textAlign:"right"}}><div style={S.lbl}>Total del Servicio</div><div style={{fontSize:28,fontWeight:800,color:C.bright}}>{fmt(q.total)}</div></div>
      </div>

      <div style={S.card}>
        <div style={S.sec}><span>Información General</span></div>
        <div style={{...S.g3,marginBottom:13}}>
          {[["Fecha",q.fecha],["Asesor",q.asesor],["Cel. Asesor",q.celularAsesor||"—"]].map(([l,v])=>(
            <div key={l}><span style={S.lbl}>{l}</span><div style={{fontWeight:700}}>{v}</div></div>
          ))}
        </div>
        <div style={S.g2}>
          {[["Empresa",q.empresa],["Cliente",q.cliente],["Correo",q.correo||"—"],["Celular",q.celular||"—"]].map(([l,v])=>(
            <div key={l}><span style={S.lbl}>{l}</span><div>{v}</div></div>
          ))}
        </div>
      </div>

      {q.concepto&&<div style={S.card}><div style={S.sec}><span>Concepto</span></div><p style={{color:"#ccc",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{q.concepto}</p></div>}

      <div style={S.card}>
        <div style={S.sec}><span>Partidas</span></div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={S.th}>Unidad</th><th style={S.th}>Cantidad</th><th style={S.th}>P.U.</th><th style={S.thR}>Importe</th></tr></thead>
          <tbody>
            {rows.length?rows.map((r,i)=>(
              <tr key={i}>
                <td style={{...S.td,padding:"9px 10px"}}>{r.unidad||"—"}</td>
                <td style={{...S.td,padding:"9px 10px"}}>{r.cantidad||"—"}</td>
                <td style={{...S.td,padding:"9px 10px"}}>{r.pu?fmt(r.pu):"—"}</td>
                <td style={{...S.tdR,padding:"9px 10px"}}>{r.importe?fmt(r.importe):"—"}</td>
              </tr>
            )):<tr><td colSpan={4} style={{padding:16,color:C.gray,textAlign:"center"}}>Sin partidas registradas</td></tr>}
          </tbody>
        </table>
        <div style={S.tbar}>
          <span style={{fontSize:11,letterSpacing:3,color:C.gray}}>TOTAL</span>
          <span style={{fontSize:24,fontWeight:800,color:C.green}}>{fmt(q.total)}</span>
        </div>
      </div>
    </div>
  );
}

// ── List ───────────────────────────────────────────────────────────────────
function QuoteList({quotes,driveCfg,onView,onNew,onSettings}) {
  const [q,setQ]=useState("");
  const filtered=quotes.filter(x=>[x.folio,x.empresa,x.cliente,x.asesor].some(v=>v.toLowerCase().includes(q.toLowerCase())));
  const total=quotes.reduce((s,x)=>s+x.total,0);
  const driveConfigured=ASESORES.filter(a=>driveCfg?.[a]).length;
  return (
    <div>
      <div style={{display:"flex",gap:11,marginBottom:18,flexWrap:"wrap"}}>
        {[[`📋 ${quotes.length}`,`Cotizaci${quotes.length===1?"ón":"ones"}`],[fmt(total),"Total Facturado"],[`${driveConfigured}/${ASESORES.length}`,`Drive Configurado`]].map(([v,l])=>(
          <div key={l} style={{...S.card,flex:1,minWidth:140,marginBottom:0,padding:"13px 18px"}}>
            <div style={S.lbl}>{l}</div>
            <div style={{fontSize:20,fontWeight:800,color:C.green,marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:9,marginBottom:14,flexWrap:"wrap"}}>
        <input style={{...S.inp,flex:1,minWidth:190}} placeholder="🔍  Buscar folio, empresa, cliente, asesor..." value={q} onChange={e=>setQ(e.target.value)}/>
        <button style={S.btnS} onClick={onSettings}>⚙️ Drive</button>
        <button style={S.btnP} onClick={onNew}>+ Nueva</button>
      </div>
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"55px 20px",color:C.gray}}>
          <div style={{fontSize:42,marginBottom:9}}>📋</div>
          <div style={{fontSize:17,fontWeight:700}}>{quotes.length===0?"Sin cotizaciones aún":"Sin resultados"}</div>
          <div style={{fontSize:12,marginTop:4}}>{quotes.length===0?"Crea la primera con el botón de arriba.":"Prueba con otro término."}</div>
        </div>
      ):(
        <div style={S.card}>
          <div style={{...S.listRow,cursor:"default",borderBottom:`2px solid ${C.green}`}}>
            {["Folio","Empresa / Cliente","Asesor","Total","Fecha","Drive"].map(h=>(
              <div key={h} style={{...S.cell,fontSize:10,fontWeight:700,letterSpacing:2,color:C.gray,textTransform:"uppercase"}}>{h}</div>
            ))}
          </div>
          {filtered.map(x=>(
            <div key={x.folio} style={S.listRow} onClick={()=>onView(x)}
              onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={S.cell}><span style={S.badge(C.green)}>{x.folio}</span></div>
              <div style={S.cell}><div style={{fontWeight:700}}>{x.empresa}</div><div style={{color:C.gray,fontSize:11,marginTop:1}}>{x.cliente}</div></div>
              <div style={{...S.cell,color:C.silver,fontSize:12}}>{x.asesor}</div>
              <div style={{...S.cell,color:C.bright,fontWeight:800,fontSize:14}}>{fmt(x.total)}</div>
              <div style={{...S.cell,color:C.gray,fontSize:12}}>{x.fecha}</div>
              <div style={S.cell}>{driveCfg?.[x.asesor]?"✅":"⚠️"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setView]=useState("list");
  const [quotes,setQuotes]=useState([]);
  const [selected,setSelected]=useState(null);
  const [initForm,setInitForm]=useState(null);
  const [driveCfg,setDriveCfg]=useState({});
  const [showSettings,setShowSettings]=useState(false);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState("");

  useEffect(()=>{
    (async()=>{
      try{
        const q=await window.storage.get("cotizaciones-rm-v2");
        if(q?.value)setQuotes(JSON.parse(q.value));
        const d=await window.storage.get("drive-config-rm");
        if(d?.value)setDriveCfg(JSON.parse(d.value));
      }catch{}
      setLoading(false);
    })();
  },[]);

  const persist=async(list)=>{setQuotes(list);try{await window.storage.set("cotizaciones-rm-v2",JSON.stringify(list));}catch{}};
  const showToast=(m,d=2800)=>{setToast(m);setTimeout(()=>setToast(""),d);};

  const handleNew=()=>{setInitForm(newForm(genFolio(quotes)));setView("new");};
  const handleSave=async(q)=>{const u=[q,...quotes];await persist(u);showToast(`✓ ${q.folio} guardada`);setView("list");};
  const handleDelete=async(folio)=>{await persist(quotes.filter(q=>q.folio!==folio));showToast("Cotización eliminada");setView("list");};
  const handleSaveDrive=async(cfg)=>{
    setDriveCfg(cfg);
    try{await window.storage.set("drive-config-rm",JSON.stringify(cfg));}catch{}
    showToast("✓ Configuración de Drive guardada");
  };

  if(loading)return <div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><div style={{color:C.green,fontSize:16,letterSpacing:4}}>CARGANDO...</div></div>;

  return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box} input:focus,textarea:focus,select:focus{border-color:#1a7a2e!important;box-shadow:0 0 0 2px #1a7a2e22}
        button:hover{opacity:.85} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#1a7a2e}`}</style>

      <div style={S.hdr}>
        <div style={S.brandWrap}>
          <div style={S.brandIcon}>🏗</div>
          <div><div style={S.brandName}>GRÚAS & RIGGING RM</div><div style={S.brandSub}>Sistema de Cotizaciones</div></div>
        </div>
        <div style={S.nav}>
          <button style={S.nb(view==="list"||view==="detail")} onClick={()=>setView("list")}>📋 Cotizaciones</button>
          <button style={S.nb(view==="new")} onClick={handleNew}>+ Nueva</button>
          <button style={S.nb(false)} onClick={()=>setShowSettings(true)}>⚙️</button>
        </div>
      </div>

      <div style={S.wrap}>
        {view==="list"&&<QuoteList quotes={quotes} driveCfg={driveCfg} onView={q=>{setSelected(q);setView("detail");}} onNew={handleNew} onSettings={()=>setShowSettings(true)}/>}
        {view==="new"&&initForm&&(
          <>
            <div style={{marginBottom:16}}><div style={{fontSize:19,fontWeight:800,letterSpacing:1}}>Nueva Cotización</div><div style={{fontSize:12,color:C.gray,marginTop:2}}>Folio generado automáticamente</div></div>
            <QuoteForm init={initForm} onSave={handleSave} onCancel={()=>setView("list")}/>
          </>
        )}
        {view==="detail"&&selected&&<QuoteDetail q={selected} driveCfg={driveCfg} onBack={()=>setView("list")} onDelete={handleDelete}/>}
      </div>

      {showSettings&&<SettingsModal settings={driveCfg} onSave={handleSaveDrive} onClose={()=>setShowSettings(false)}/>}
      {toast&&<div style={S.toast}>{toast}</div>}
    </div>
  );
}
