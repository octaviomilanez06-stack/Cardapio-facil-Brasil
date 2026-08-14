import { useState, useRef, useEffect } from "react";

const SUPABASE_URL = "https://uhhddjkwrookoivvrunz.supabase.co";
const SUPABASE_KEY = "sb_publishable_RPyD9IG4CMQ6Cbon7SmbzA_21Fvy20X";
const WHATSAPP_NUMBER = "5521977016114";
const ADMIN_PASSWORD = "admin123";

async function db(table, method = "GET", body = null, filter = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filter}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #F5F0EB; color: #1A1A1A; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  input, textarea, select, button { font-family: 'Inter', sans-serif; }
  .st { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
`;

const DEFAULT_STORE = {
  name: "Billy Chicken",
  slogan: "Da nossa casa para sua casa com todo CARINHO E TEMPERO",
  category: "Hambúrgueres & Frango",
  delivery_fee: 5.00, min_order: 20.00,
  delivery_time: "40-60 min", prep_time: "20-30 min",
  open_time: "00:00", close_time: "23:59",
  open_days: "0,1,2,3,4,5,6",
  banner: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80",
  logo: "🍗", logo_shape: "circle", title_color: "#8B1A1A", is_open: true,
};

const WEEKDAYS = [
  { val: 0, label: "Dom" },
  { val: 1, label: "Seg" },
  { val: 2, label: "Ter" },
  { val: 3, label: "Qua" },
  { val: 4, label: "Qui" },
  { val: 5, label: "Sex" },
  { val: 6, label: "Sáb" },
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: "🍔 Hambúrgueres", order: 1 },
  { id: 2, name: "🍗 Combos", order: 2 },
  { id: 3, name: "🍟 Acompanhamentos", order: 3 },
  { id: 4, name: "🥤 Bebidas", order: 4 },
  { id: 5, name: "🍰 Sobremesas", order: 5 },
];

const TAG_COLORS = { bestseller: "#8B1A1A", new: "#2ECC71", promo: "#F59E0B" };
const TAG_LABELS = { bestseller: "Mais Vendido", new: "Novo", promo: "Promoção" };
const STATUS_FLOW = ["received","accepted","preparing","delivering","delivered"];
const STATUS_LABELS = { received:"Recebido", accepted:"Aceito", preparing:"Preparando", delivering:"A caminho", delivered:"Entregue" };

function Badge({ tag }) {
  if (!tag) return null;
  return <span style={{background:TAG_COLORS[tag],color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,textTransform:"uppercase"}}>{TAG_LABELS[tag]}</span>;
}

function ImageUpload({ value, onChange, style }) {
  const ref = useRef();
  return (
    <div style={style}>
      <input ref={ref} type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onChange(ev.target.result);r.readAsDataURL(f);}} style={{display:"none"}} />
      <div onClick={()=>ref.current.click()} style={{border:"2px dashed #D4C5B0",borderRadius:12,padding:14,textAlign:"center",cursor:"pointer",background:"#FAF7F4"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#8B1A1A"} onMouseLeave={e=>e.currentTarget.style.borderColor="#D4C5B0"}>
        {value?<img src={value} alt="preview" style={{maxHeight:120,borderRadius:8,objectFit:"cover",maxWidth:"100%"}} />:<div><div style={{fontSize:28,marginBottom:6}}>📷</div><p style={{fontSize:13,color:"#9B8B7A"}}>Clique para escolher imagem</p></div>}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{minHeight:"100vh",background:"#1A0A0A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{globalStyles}</style>
      <div style={{fontSize:56,marginBottom:16}}>🍗</div>
      <p className="st" style={{fontSize:28,color:"#8B1A1A"}}>Billy Chicken</p>
      <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginTop:8}}>Carregando...</p>
    </div>
  );
}

function isStoreOpen(store) {
  if (!store.is_open) return false;
  const now = new Date();
  const openDays = (store.open_days||"0,1,2,3,4,5,6").split(",").map(Number).filter(n=>!isNaN(n));
  if (openDays.length>0 && !openDays.includes(now.getDay())) return false;
  const [oh,om] = (store.open_time||"00:00").split(":").map(Number);
  const [ch,cm] = (store.close_time||"23:59").split(":").map(Number);
  const cur = now.getHours()*60+now.getMinutes();
  const op = oh*60+om, cl = ch*60+cm;
  return cl<op ? cur>=op||cur<=cl : cur>=op&&cur<=cl;
}

function parseC(str) { try { return JSON.parse(str||"[]"); } catch { return []; } }

function ComplementSelector({ complements, selected, onChange }) {
  if (!complements||complements.length===0) return null;
  return (
    <div style={{marginTop:16}}>
      {complements.map(group=>(
        <div key={group.id} style={{marginBottom:16}}>
          <div style={{background:"#F5F0EB",borderRadius:10,padding:"10px 14px",marginBottom:8}}>
            <p style={{fontWeight:700,fontSize:14}}>{group.title}</p>
            <p style={{fontSize:11,color:"#9B8B7A"}}>Escolha até {group.max} opção{group.max>1?"ões":""}</p>
          </div>
          {group.options.map((opt,i)=>{
            const key=`${group.id}-${i}`;
            const count=selected[key]||0;
            const groupTotal=group.options.reduce((s,_,j)=>s+(selected[`${group.id}-${j}`]||0),0);
            if(opt.sold_out){
              return (
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 4px",borderBottom:"1px solid #F0EAE3",opacity:0.5}}>
                  <div>
                    <p style={{fontSize:14,fontWeight:500,textDecoration:"line-through"}}>{opt.name}</p>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:"#9B8B7A"}}>Esgotado</span>
                </div>
              );
            }
            return (
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 4px",borderBottom:"1px solid #F0EAE3"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:500}}>{opt.name}</p>
                  {opt.price>0&&<p style={{fontSize:12,color:"#8B1A1A",fontWeight:600}}>+ R$ {opt.price.toFixed(2)}</p>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {count>0&&<button onClick={()=>onChange({...selected,[key]:count-1})} style={{background:"#F0EAE3",border:"none",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontWeight:700,fontSize:16}}>−</button>}
                  {count>0&&<span style={{fontWeight:700,minWidth:16,textAlign:"center"}}>{count}</span>}
                  <button onClick={()=>{if(groupTotal<group.max)onChange({...selected,[key]:count+1});}} disabled={groupTotal>=group.max&&count===0} style={{background:groupTotal>=group.max&&count===0?"#E5DDD5":"#8B1A1A",color:"#fff",border:"none",width:28,height:28,borderRadius:"50%",cursor:groupTotal>=group.max&&count===0?"not-allowed":"pointer",fontWeight:700,fontSize:16}}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── CUSTOMER LOGIN/REGISTER ──────────────────────────────────────────────────
function CustomerAuth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  function getUsers() {
    try { return JSON.parse(localStorage.getItem("billy_users")||"[]"); } catch { return []; }
  }
  function saveUsers(users) { localStorage.setItem("billy_users",JSON.stringify(users)); }

  function handleLogin() {
    const users = getUsers();
    const user = users.find(u=>u.phone===phone&&u.pwd===pwd);
    if (!user) { setError("Telefone ou senha incorretos!"); return; }
    localStorage.setItem("billy_current_user", JSON.stringify(user));
    onLogin(user);
  }

  function handleRegister() {
    if (!name||!phone||!pwd) { setError("Preencha todos os campos!"); return; }
    const users = getUsers();
    if (users.find(u=>u.phone===phone)) { setError("Este telefone já está cadastrado!"); return; }
    const user = { id: Date.now(), name, phone, pwd, orders: [], createdAt: new Date().toLocaleDateString("pt-BR") };
    saveUsers([...users, user]);
    localStorage.setItem("billy_current_user", JSON.stringify(user));
    onLogin(user);
  }

  return (
    <div style={{minHeight:"100vh",background:"#1A0A0A",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{globalStyles}</style>
      <div style={{background:"#fff",borderRadius:20,padding:36,width:"100%",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{fontSize:48,marginBottom:12}}>🍗</div>
        <h2 className="st" style={{fontSize:26,color:"#8B1A1A",marginBottom:4}}>Billy Chicken</h2>
        <p style={{color:"#9B8B7A",fontSize:13,marginBottom:24}}>Da nossa casa para sua casa 🥰</p>

        <div style={{display:"flex",background:"#F5F0EB",borderRadius:12,padding:4,marginBottom:24}}>
          <button onClick={()=>{setMode("login");setError("");}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:mode==="login"?"#fff":"transparent",fontWeight:700,fontSize:14,color:mode==="login"?"#8B1A1A":"#9B8B7A",boxShadow:mode==="login"?"0 2px 8px rgba(0,0,0,0.1)":"none"}}>Entrar</button>
          <button onClick={()=>{setMode("register");setError("");}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:mode==="register"?"#fff":"transparent",fontWeight:700,fontSize:14,color:mode==="register"?"#8B1A1A":"#9B8B7A",boxShadow:mode==="register"?"0 2px 8px rgba(0,0,0,0.1)":"none"}}>Cadastrar</button>
        </div>

        {mode==="register"&&(
          <div style={{marginBottom:14,textAlign:"left"}}>
            <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Seu nome</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: João Silva" style={{width:"100%",border:"2px solid #E5DDD5",borderRadius:10,padding:"11px 14px",outline:"none",fontSize:14}} onFocus={e=>e.target.style.borderColor="#8B1A1A"} onBlur={e=>e.target.style.borderColor="#E5DDD5"} />
          </div>
        )}
        <div style={{marginBottom:14,textAlign:"left"}}>
          <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>WhatsApp (com DDD)</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Ex: 21999990000" type="tel" style={{width:"100%",border:"2px solid #E5DDD5",borderRadius:10,padding:"11px 14px",outline:"none",fontSize:14}} onFocus={e=>e.target.style.borderColor="#8B1A1A"} onBlur={e=>e.target.style.borderColor="#E5DDD5"} />
        </div>
        <div style={{marginBottom:20,textAlign:"left"}}>
          <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Senha</label>
          <input value={pwd} onChange={e=>setPwd(e.target.value)} type="password" placeholder="Mínimo 4 caracteres" style={{width:"100%",border:"2px solid #E5DDD5",borderRadius:10,padding:"11px 14px",outline:"none",fontSize:14}} onFocus={e=>e.target.style.borderColor="#8B1A1A"} onBlur={e=>e.target.style.borderColor="#E5DDD5"} onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleRegister())} />
        </div>
        {error&&<p style={{color:"#EF4444",fontSize:13,marginBottom:14,background:"#FEE2E2",padding:"8px 12px",borderRadius:8}}>{error}</p>}
        <button onClick={mode==="login"?handleLogin:handleRegister} style={{width:"100%",background:"#8B1A1A",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:15,cursor:"pointer"}}>
          {mode==="login"?"Entrar →":"Criar Conta →"}
        </button>
        <button onClick={()=>onLogin(null)} style={{width:"100%",background:"transparent",border:"none",color:"#9B8B7A",fontSize:13,marginTop:12,cursor:"pointer",padding:8}}>
          Continuar sem cadastro
        </button>
      </div>
    </div>
  );
}

// ─── ORDER HISTORY ─────────────────────────────────────────────────────────────
function OrderHistory({ user, onBack }) {
  const orders = user?.orders || [];
  return (
    <div style={{minHeight:"100vh",background:"#F5F0EB"}}>
      <style>{globalStyles}</style>
      <div style={{background:"#1A0A0A",padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:"#fff",fontSize:24,cursor:"pointer"}}>←</button>
        <h2 className="st" style={{color:"#fff",fontSize:22}}>Meus Pedidos</h2>
      </div>
      <div style={{maxWidth:560,margin:"0 auto",padding:24}}>
        {orders.length===0?(
          <div style={{textAlign:"center",padding:60}}>
            <div style={{fontSize:48,marginBottom:12}}>🛵</div>
            <p style={{fontWeight:700,fontSize:16,color:"#9B8B7A"}}>Nenhum pedido ainda</p>
            <p style={{fontSize:14,color:"#B8AFA8",marginTop:8}}>Seus pedidos aparecerão aqui após a compra.</p>
          </div>
        ):(
          [...orders].reverse().map((order,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:16,padding:20,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <p style={{fontWeight:700,fontSize:15}}>Pedido #{order.id}</p>
                  <p style={{fontSize:12,color:"#9B8B7A",marginTop:2}}>{order.date} às {order.time}</p>
                </div>
                <span style={{background:"#D1FAE5",color:"#065F46",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>Enviado</span>
              </div>
              <div style={{borderTop:"1px solid #F5F0EB",paddingTop:12}}>
                {order.items.map((item,j)=>(
                  <p key={j} style={{fontSize:13,color:"#6B7280",marginBottom:4}}>{item.qty}x {item.name}{item.extrasText?` (${item.extrasText})`:""}</p>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"1px solid #F5F0EB"}}>
                  <span style={{fontSize:13,color:"#9B8B7A"}}>{order.type==="delivery"?"🛵 Entrega":"🏪 Retirada"} • {order.payment?.toUpperCase()}</span>
                  <span className="st" style={{fontSize:16,color:"#8B1A1A"}}>R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── CUSTOMER AREA ────────────────────────────────────────────────────────────
function CustomerArea({ products, store, categories, user, onLogout }) {
  const [cart,setCart]=useState([]);
  const [activeCategory,setActiveCategory]=useState("Todos");
  const [search,setSearch]=useState("");
  const [selProduct,setSelProduct]=useState(null);
  const [selComplements,setSelComplements]=useState({});
  const [showCart,setShowCart]=useState(false);
  const [step,setStep]=useState("menu");
  const [orderType,setOrderType]=useState("delivery");
  const [info,setInfo]=useState({name:user?.name||"",phone:user?.phone||"",address:"",payment:"pix",change:""});
  const [showHistory,setShowHistory]=useState(false);
  const [currentUser,setCurrentUser]=useState(user);

  const open = isStoreOpen(store);
  const sortedCats = [...categories].sort((a,b)=>a.order-b.order);
  const activeProducts = products.filter(p=>p.active);
  const allCats = ["Todos",...sortedCats.map(c=>c.name)];
  const filtered = activeProducts.filter(p=>{
    const mc = activeCategory==="Todos"||p.category===activeCategory;
    const ms = !search||p.name.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });

  const cartTotal = cart.reduce((s,i)=>s+(i.price+i.extrasTotal)*i.qty,0);
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const total = cartTotal+(orderType==="delivery"?Number(store.delivery_fee):0);

  function getExtrasTotal(comps,sel){
    if(!comps)return 0;
    return comps.reduce((s,g)=>s+g.options.reduce((gs,opt,i)=>gs+(sel[`${g.id}-${i}`]||0)*opt.price,0),0);
  }
  function getExtrasText(comps,sel){
    if(!comps)return "";
    const items=[];
    comps.forEach(g=>g.options.forEach((opt,i)=>{const c=sel[`${g.id}-${i}`]||0;if(c>0)items.push(`${c}x ${opt.name}`);}));
    return items.join(", ");
  }
  function addToCart(p,comps,sel){
    setCart(prev=>[...prev,{...p,cartId:Date.now(),qty:1,extrasTotal:getExtrasTotal(comps,sel),extrasText:getExtrasText(comps,sel)}]);
    setSelProduct(null);setSelComplements({});
  }
  function changeQty(cartId,delta){
    setCart(prev=>prev.map(i=>i.cartId===cartId?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0));
  }

  function sendWhatsApp(){
    if(!info.name||!info.phone)return alert("Preencha nome e telefone!");
    if(orderType==="delivery"&&!info.address)return alert("Preencha o endereço!");
    const mapsLink = orderType==="delivery" ? `\n🗺️ *Ver no Maps:* https://maps.google.com/?q=${encodeURIComponent(info.address)}` : "";
    const items = cart.map(i=>`• ${i.qty}x ${i.name}${i.extrasText?` (${i.extrasText})`:""} — R$ ${((i.price+i.extrasTotal)*i.qty).toFixed(2)}`).join("\n");
    const msg = `🍗 *NOVO PEDIDO - ${store.name.toUpperCase()}*\n\n👤 *Cliente:* ${info.name}\n📱 *Telefone:* ${info.phone}\n${orderType==="delivery"?`📍 Endereço: ${info.address}${mapsLink}\n`:"🏪 Retirada no local\n"}\n🛒 Itens:\n${items}\n\n💰 Subtotal: R$ ${cartTotal.toFixed(2)}${orderType==="delivery"?`\n🛵 *Entrega:* R$ ${Number(store.delivery_fee).toFixed(2)}`:""}\n💵 Total: R$ ${total.toFixed(2)}\n💳 Pagamento: ${info.payment.toUpperCase()}${info.payment==="dinheiro"&&info.change?`\n💵 *Troco para:* R$ ${info.change}`:""}\n📦 Tipo: ${orderType==="delivery"?"Entrega":"Retirada"}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank");

    // Save order to user history
    if(currentUser){
      const now = new Date();
      const newOrder = {
        id: Date.now(),
        date: now.toLocaleDateString("pt-BR"),
        time: now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),
        items: cart.map(i=>({name:i.name,qty:i.qty,extrasText:i.extrasText})),
        total, type: orderType, payment: info.payment,
      };
      const users = JSON.parse(localStorage.getItem("billy_users")||"[]");
      const updated = users.map(u=>u.id===currentUser.id?{...u,orders:[...(u.orders||[]),newOrder]}:u);
      localStorage.setItem("billy_users",JSON.stringify(updated));
      const updatedUser = {...currentUser,orders:[...(currentUser.orders||[]),newOrder]};
      setCurrentUser(updatedUser);
      localStorage.setItem("billy_current_user",JSON.stringify(updatedUser));
    }

    setStep("success");
    setCart([]);
  }

  if(showHistory&&currentUser) return <OrderHistory user={currentUser} onBack={()=>setShowHistory(false)} />;

  // Loja fechada — tela bonita
  if(!open) return (
    <div style={{minHeight:"100vh",background:"#1A0A0A",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:24,textAlign:"center"}}>
      <style>{globalStyles}</style>
      <div style={{width:100,height:100,background:"#fff",borderRadius:store.logo_shape==="circle"?"50%":20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:(store.logo?.startsWith("data:")||store.logo?.startsWith("http"))?0:48,overflow:"hidden",marginBottom:24,boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
        {(store.logo?.startsWith("data:")||store.logo?.startsWith("http"))?<img src={store.logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}} />:store.logo}
      </div>
      <h1 className="st" style={{color:store.title_color||"#8B1A1A",fontSize:36,marginBottom:8}}>{store.name}</h1>
      <p style={{color:"rgba(255,255,255,0.5)",fontSize:14,marginBottom:24,fontStyle:"italic"}}>{store.slogan}</p>
      <div style={{background:"rgba(255,255,255,0.08)",borderRadius:16,padding:"20px 32px",marginBottom:16}}>
        <p style={{color:"rgba(255,255,255,0.9)",fontSize:16,fontWeight:600,marginBottom:4}}>Estamos fechados no momento</p>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:14}}>Abrimos às {store.open_time} • Fechamos às {store.close_time}</p>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:14,marginTop:4}}>{(() => {
          const openDays=(store.open_days||"0,1,2,3,4,5,6").split(",").map(Number).filter(n=>!isNaN(n));
          if(openDays.length===7)return "Todos os dias";
          return WEEKDAYS.filter(d=>openDays.includes(d.val)).map(d=>d.label).join(", ");
        })()}</p>
      </div>
      <p style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>Volte em breve! 🥰</p>
    </div>
  );

  if(step==="success") return (
    <div style={{minHeight:"100vh",background:"#F5F0EB",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <style>{globalStyles}</style>
      <div style={{background:"#fff",borderRadius:24,padding:40,maxWidth:400,width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:64,marginBottom:16}}>🎉</div>
        <h2 className="st" style={{fontSize:26,color:"#8B1A1A",marginBottom:8}}>Pedido Enviado!</h2>
        <p style={{color:"#9B8B7A",fontSize:14,marginBottom:24,lineHeight:1.6}}>Seu pedido foi enviado pelo WhatsApp. Em breve você receberá a confirmação!</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <button onClick={()=>setStep("menu")} style={{background:"#8B1A1A",color:"#fff",border:"none",borderRadius:12,padding:"14px",fontWeight:800,fontSize:15,cursor:"pointer"}}>🍔 Fazer Novo Pedido</button>
          {currentUser&&<button onClick={()=>setShowHistory(true)} style={{background:"#F5F0EB",border:"none",borderRadius:12,padding:"14px",fontWeight:700,fontSize:14,cursor:"pointer",color:"#8B1A1A"}}>📋 Ver Meus Pedidos</button>}
        </div>
      </div>
    </div>
  );

  if(step==="checkout") return (
    <div style={{minHeight:"100vh",background:"#F5F0EB"}}>
      <style>{globalStyles}</style>
      <div style={{background:"#1A0A0A",padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
        <button onClick={()=>setStep("menu")} style={{background:"transparent",border:"none",color:"#fff",fontSize:24,cursor:"pointer"}}>←</button>
        <h2 className="st" style={{color:"#fff",fontSize:22}}>Finalizar Pedido</h2>
      </div>
      <div style={{maxWidth:500,margin:"0 auto",padding:24}}>
        <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:16}}>
          <h3 style={{fontWeight:700,marginBottom:14}}>Tipo de pedido</h3>
          <div style={{display:"flex",gap:12}}>
            {["delivery","retirada"].map(t=>(
              <button key={t} onClick={()=>setOrderType(t)} style={{flex:1,padding:12,borderRadius:12,border:`2px solid ${orderType===t?"#8B1A1A":"#E5DDD5"}`,background:orderType===t?"#FFF5F5":"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>
                {t==="delivery"?"🛵 Entrega":"🏪 Retirada"}
              </button>
            ))}
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:16}}>
          <h3 style={{fontWeight:700,marginBottom:14}}>Seus dados</h3>
          {[["name","Seu nome *","text"],["phone","Seu WhatsApp *","tel"]].map(([f,l,t])=>(
            <div key={f} style={{marginBottom:12}}>
              <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>{l}</label>
              <input type={t} value={info[f]} onChange={e=>setInfo(p=>({...p,[f]:e.target.value}))} style={{width:"100%",border:"2px solid #E5DDD5",borderRadius:10,padding:"10px 14px",outline:"none",fontSize:14}} onFocus={e=>e.target.style.borderColor="#8B1A1A"} onBlur={e=>e.target.style.borderColor="#E5DDD5"} />
            </div>
          ))}
          {orderType==="delivery"&&(
            <div>
              <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Endereço completo *</label>
              <input type="text" placeholder="Rua, número, bairro, cidade" value={info.address} onChange={e=>setInfo(p=>({...p,address:e.target.value}))} style={{width:"100%",border:"2px solid #E5DDD5",borderRadius:10,padding:"10px 14px",outline:"none",fontSize:14,marginBottom:8}} onFocus={e=>e.target.style.borderColor="#8B1A1A"} onBlur={e=>e.target.style.borderColor="#E5DDD5"} />
              {info.address&&<a href={`https://maps.google.com/?q=${encodeURIComponent(info.address)}`} target="_blank" rel="noreferrer" style={{fontSize:12,color:"#8B1A1A",fontWeight:600}}>🗺️ Ver no Google Maps</a>}
            </div>
          )}
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:16}}>
          <h3 style={{fontWeight:700,marginBottom:14}}>Pagamento</h3>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[["pix","PIX"],["cartao","Cartão"],["dinheiro","Dinheiro"]].map(([val,label])=>(
              <button key={val} onClick={()=>setInfo(p=>({...p,payment:val}))} style={{padding:"10px 18px",borderRadius:10,border:`2px solid ${info.payment===val?"#8B1A1A":"#E5DDD5"}`,background:info.payment===val?"#FFF5F5":"#fff",fontWeight:600,cursor:"pointer",fontSize:14}}>{label}</button>
            ))}
          </div>
          {info.payment==="dinheiro"&&(
            <div style={{marginTop:12}}>
              <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Troco para quanto?</label>
              <input type="number" value={info.change} onChange={e=>setInfo(p=>({...p,change:e.target.value}))} style={{width:"100%",border:"2px solid #E5DDD5",borderRadius:10,padding:"10px 14px",outline:"none"}} />
            </div>
          )}
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:20}}>
          <h3 style={{fontWeight:700,marginBottom:14}}>Resumo</h3>
          {cart.map(i=>(
            <div key={i.cartId} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #F5F0EB"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:14}}>
                <span>{i.qty}x {i.name}</span>
                <span style={{fontWeight:600}}>R$ {((i.price+i.extrasTotal)*i.qty).toFixed(2)}</span>
              </div>
              {i.extrasText&&<p style={{fontSize:11,color:"#9B8B7A",marginTop:2}}>{i.extrasText}</p>}
            </div>
          ))}
          <div style={{borderTop:"1px solid #E5DDD5",marginTop:12,paddingTop:12}}>
            {orderType==="delivery"&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:6,color:"#9B8B7A"}}><span>Taxa de entrega</span><span>R$ {Number(store.delivery_fee).toFixed(2)}</span></div>}
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:16}}><span>Total</span><span style={{color:"#8B1A1A"}}>R$ {total.toFixed(2)}</span></div>
          </div>
        </div>
        <button onClick={sendWhatsApp} style={{width:"100%",background:"#25D366",color:"#fff",border:"none",borderRadius:14,padding:18,fontWeight:800,fontSize:16,cursor:"pointer"}}>📱 Enviar pedido pelo WhatsApp</button>
      </div>
    </div>
  );

  const parsedC = selProduct?parseC(selProduct.complements):[];

  return (
    <div style={{minHeight:"100vh",background:"#F5F0EB"}}>
      <style>{globalStyles}</style>
      <div style={{position:"relative",height:260}}>
        <img src={store.banner} alt="banner" style={{width:"100%",height:"100%",objectFit:"cover"}} />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(20,5,5,0.85))"}} />
        {/* User button top right */}
        <div style={{position:"absolute",top:16,right:16,display:"flex",gap:8}}>
          {currentUser?(
            <>
              <button onClick={()=>setShowHistory(true)} style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"none",color:"#fff",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>📋 Pedidos</button>
              <button onClick={()=>{localStorage.removeItem("billy_current_user");onLogout();}} style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"none",color:"#fff",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sair</button>
            </>
          ):(
            <button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"none",color:"#fff",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>👤 Entrar</button>
          )}
        </div>
        <div style={{position:"absolute",bottom:20,left:20,right:20,color:"#fff"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
            <div style={{width:60,height:60,background:"#fff",borderRadius:store.logo_shape==="circle"?"50%":14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:(store.logo?.startsWith("data:")||store.logo?.startsWith("http"))?0:30,overflow:"hidden",border:"3px solid rgba(255,255,255,0.3)",flexShrink:0}}>
              {(store.logo?.startsWith("data:")||store.logo?.startsWith("http"))?<img src={store.logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}} />:store.logo}
            </div>
            <div>
              <h1 className="st" style={{fontSize:28,color:store.title_color||"#8B1A1A",textShadow:"0 2px 8px rgba(0,0,0,0.5)"}}>{store.name}</h1>
              <p style={{fontSize:12,opacity:0.8,marginTop:2}}>{store.category}</p>
              {currentUser&&<p style={{fontSize:11,opacity:0.7,marginTop:2}}>Olá, {currentUser.name}! 👋</p>}
            </div>
          </div>
          <p style={{fontSize:12,opacity:0.7,marginBottom:8,fontStyle:"italic"}}>{store.slogan} 🥰</p>
          <div style={{display:"flex",gap:10,fontSize:11,flexWrap:"wrap"}}>
            <span style={{background:"rgba(255,255,255,0.15)",padding:"3px 10px",borderRadius:20}}>🕐 {store.delivery_time}</span>
            <span style={{background:"rgba(255,255,255,0.15)",padding:"3px 10px",borderRadius:20}}>📦 Mín. R$ {Number(store.min_order).toFixed(2)}</span>
            <span style={{background:"rgba(255,255,255,0.15)",padding:"3px 10px",borderRadius:20}}>🛵 R$ {Number(store.delivery_fee).toFixed(2)}</span>
            <span style={{background:"#2ECC71",color:"#fff",padding:"3px 10px",borderRadius:20,fontWeight:700}}>● Aberto • Fecha {store.close_time}</span>
          </div>
        </div>
      </div>

      <div style={{background:"#fff",padding:"12px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{position:"relative",maxWidth:600,margin:"0 auto"}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar produto..." style={{width:"100%",border:"2px solid #E5DDD5",borderRadius:12,padding:"10px 14px 10px 42px",fontSize:14,outline:"none"}} onFocus={e=>e.target.style.borderColor="#8B1A1A"} onBlur={e=>e.target.style.borderColor="#E5DDD5"} />
        </div>
      </div>

      <div style={{background:"#fff",borderBottom:"1px solid #E5DDD5",overflowX:"auto",whiteSpace:"nowrap",padding:"0 16px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"inline-flex",gap:4,padding:"10px 0"}}>
          {allCats.map(cat=>(
            <button key={cat} onClick={()=>setActiveCategory(cat)} style={{padding:"8px 16px",borderRadius:24,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:activeCategory===cat?"#8B1A1A":"#F5F0EB",color:activeCategory===cat?"#fff":"#1A1A1A",whiteSpace:"nowrap",transition:"all 0.2s"}}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}}>
        {sortedCats.filter(cat=>activeCategory==="Todos"||activeCategory===cat.name).map(cat=>{
          const cp=filtered.filter(p=>p.category===cat.name).sort((a,b)=>(a.position||0)-(b.position||0));
          if(cp.length===0)return null;
          return (
            <div key={cat.id} style={{marginBottom:32}}>
              <h2 className="st" style={{fontSize:22,color:"#8B1A1A",marginBottom:16,paddingBottom:8,borderBottom:"2px solid #E5DDD5"}}>{cat.name}</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(270px, 1fr))",gap:16}}>
                {cp.map(p=>(
                  <div key={p.id} onClick={()=>{setSelProduct(p);setSelComplements({});}} style={{background:"#fff",borderRadius:18,overflow:"hidden",cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",transition:"transform 0.2s,box-shadow 0.2s",opacity:p.sold_out?0.6:1}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.12)";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.07)";}}>
                    <div style={{position:"relative",height:190}}>
                      <img src={p.image} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",filter:p.sold_out?"grayscale(70%)":"none"}} />
                      {p.tag&&!p.sold_out&&<div style={{position:"absolute",top:10,left:10}}><Badge tag={p.tag} /></div>}
                      {p.sold_out&&<div style={{position:"absolute",top:10,left:10,background:"#1A1A1A",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,textTransform:"uppercase"}}>Esgotado</div>}
                    </div>
                    <div style={{padding:16}}>
                      <h3 style={{fontSize:15,fontWeight:700,marginBottom:6}}>{p.name}</h3>
                      <p style={{fontSize:12,color:"#9B8B7A",marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.description}</p>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span className="st" style={{fontSize:18,color:"#8B1A1A"}}>R$ {Number(p.price).toFixed(2)}</span>
                        {p.sold_out?(
                          <span style={{fontSize:11,fontWeight:700,color:"#9B8B7A"}}>Indisponível</span>
                        ):(
                          <button onClick={e=>{e.stopPropagation();const c=parseC(p.complements);if(c.length>0){setSelProduct(p);setSelComplements({});}else{addToCart(p,[],{});}}} style={{background:"#8B1A1A",color:"#fff",border:"none",borderRadius:10,width:36,height:36,fontSize:20,cursor:"pointer"}}>+</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {cartCount>0&&(
        <button onClick={()=>setShowCart(true)} style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#8B1A1A",color:"#fff",border:"none",borderRadius:14,padding:"15px 28px",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 8px 28px rgba(139,26,26,0.4)",display:"flex",alignItems:"center",gap:12,zIndex:200,whiteSpace:"nowrap"}}>
          <span style={{background:"rgba(255,255,255,0.25)",borderRadius:20,padding:"2px 10px",fontSize:13}}>{cartCount}</span>
          Ver Carrinho
          <span>R$ {cartTotal.toFixed(2)}</span>
        </button>
      )}

      {selProduct&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setSelProduct(null)}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:560,maxHeight:"92vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{position:"relative",height:240}}>
              <img src={selProduct.image} alt={selProduct.name} style={{width:"100%",height:"100%",objectFit:"cover",filter:selProduct.sold_out?"grayscale(70%)":"none"}} />
              <button onClick={()=>setSelProduct(null)} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.5)",color:"#fff",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer"}}>✕</button>
              {selProduct.tag&&!selProduct.sold_out&&<div style={{position:"absolute",top:14,left:14}}><Badge tag={selProduct.tag} /></div>}
              {selProduct.sold_out&&<div style={{position:"absolute",top:14,left:14,background:"#1A1A1A",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,textTransform:"uppercase"}}>Esgotado</div>}
            </div>
            <div style={{padding:24}}>
              <h2 style={{fontWeight:800,fontSize:20,marginBottom:8}}>{selProduct.name}</h2>
              <p style={{color:"#9B8B7A",lineHeight:1.7,marginBottom:16}}>{selProduct.description}</p>
              <ComplementSelector complements={parsedC} selected={selComplements} onChange={setSelComplements} />
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:20,paddingTop:16,borderTop:"1px solid #F5F0EB"}}>
                <span className="st" style={{fontSize:22,color:"#8B1A1A"}}>R$ {(Number(selProduct.price)+getExtrasTotal(parsedC,selComplements)).toFixed(2)}</span>
                {selProduct.sold_out?(
                  <span style={{background:"#F5F0EB",color:"#9B8B7A",border:"none",borderRadius:12,padding:"13px 26px",fontWeight:800,fontSize:14}}>Esgotado</span>
                ):(
                  <button onClick={()=>addToCart(selProduct,parsedC,selComplements)} style={{background:"#8B1A1A",color:"#fff",border:"none",borderRadius:12,padding:"13px 26px",fontWeight:800,fontSize:14,cursor:"pointer"}}>Adicionar</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCart&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowCart(false)}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid #F5F0EB",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{fontWeight:800,fontSize:18}}>Seu Carrinho 🛒</h2>
              <button onClick={()=>setShowCart(false)} style={{background:"#F5F0EB",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"16px 24px"}}>
              {cart.map(item=>(
                <div key={item.cartId} style={{display:"flex",gap:14,marginBottom:18,paddingBottom:18,borderBottom:"1px solid #F5F0EB"}}>
                  <img src={item.image} alt={item.name} style={{width:60,height:60,borderRadius:10,objectFit:"cover"}} />
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:14}}>{item.name}</p>
                    {item.extrasText&&<p style={{fontSize:11,color:"#9B8B7A",marginTop:2}}>{item.extrasText}</p>}
                    <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
                      <button onClick={()=>changeQty(item.cartId,-1)} style={{background:"#F5F0EB",border:"none",width:26,height:26,borderRadius:"50%",cursor:"pointer",fontWeight:700}}>−</button>
                      <span style={{fontWeight:700}}>{item.qty}</span>
                      <button onClick={()=>changeQty(item.cartId,1)} style={{background:"#8B1A1A",color:"#fff",border:"none",width:26,height:26,borderRadius:"50%",cursor:"pointer",fontWeight:700}}>+</button>
                    </div>
                  </div>
                  <span className="st" style={{fontSize:16,color:"#8B1A1A"}}>R$ {((item.price+item.extrasTotal)*item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{background:"#F5F0EB",borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:15}}><span>Subtotal</span><span style={{color:"#8B1A1A"}}>R$ {cartTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={()=>{setShowCart(false);setStep("checkout");}} style={{width:"100%",background:"#8B1A1A",color:"#fff",border:"none",borderRadius:14,padding:16,fontWeight:800,fontSize:15,cursor:"pointer"}}>Finalizar Pedido →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN AREA ───────────────────────────────────────────────────────────────
function ComplementEditor({value,onChange}){
  const groups=parseC(value);
  const upd=(arr)=>onChange(JSON.stringify(arr));
  return(
    <div>
      {groups.map(g=>(
        <div key={g.id} style={{background:"#F5F0EB",borderRadius:12,padding:16,marginBottom:12}}>
          <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
            <input value={g.title} onChange={e=>upd(groups.map(x=>x.id===g.id?{...x,title:e.target.value}:x))} style={{flex:1,border:"2px solid #E5DDD5",borderRadius:8,padding:"8px 12px",outline:"none",fontSize:14,fontWeight:700}} placeholder="Nome do grupo" />
            <input type="number" value={g.max} onChange={e=>upd(groups.map(x=>x.id===g.id?{...x,max:parseInt(e.target.value)||1}:x))} style={{width:60,border:"2px solid #E5DDD5",borderRadius:8,padding:8,outline:"none",fontSize:14,textAlign:"center"}} min={1} title="Máximo" />
            <button onClick={()=>upd(groups.filter(x=>x.id!==g.id))} style={{background:"#FEE2E2",border:"none",borderRadius:8,padding:"8px 12px",cursor:"pointer",color:"#991B1B",fontWeight:700}}>✕</button>
          </div>
          {g.options.map((opt,oi)=>(
            <div key={oi} style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={opt.name} onChange={e=>upd(groups.map(x=>x.id===g.id?{...x,options:x.options.map((o,i)=>i===oi?{...o,name:e.target.value}:o)}:x))} style={{flex:1,border:"2px solid #E5DDD5",borderRadius:8,padding:"7px 12px",outline:"none",fontSize:13,textDecoration:opt.sold_out?"line-through":"none",color:opt.sold_out?"#9B8B7A":"#1A1A1A"}} placeholder="Nome" />
              <input type="number" value={opt.price} onChange={e=>upd(groups.map(x=>x.id===g.id?{...x,options:x.options.map((o,i)=>i===oi?{...o,price:parseFloat(e.target.value)||0}:o)}:x))} style={{width:70,border:"2px solid #E5DDD5",borderRadius:8,padding:7,outline:"none",fontSize:13,textAlign:"center"}} step="0.01" placeholder="R$" />
              <button onClick={()=>upd(groups.map(x=>x.id===g.id?{...x,options:x.options.map((o,i)=>i===oi?{...o,sold_out:!o.sold_out}:o)}:x))} title={opt.sold_out?"Marcar como disponível":"Marcar como esgotado"} style={{background:opt.sold_out?"#1A1A1A":"#F5F0EB",color:opt.sold_out?"#fff":"#1A1A1A",border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{opt.sold_out?"Esgotado":"Disponível"}</button>
              <button onClick={()=>upd(groups.map(x=>x.id===g.id?{...x,options:x.options.filter((_,i)=>i!==oi)}:x))} style={{background:"#FEE2E2",border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",color:"#991B1B"}}>✕</button>
            </div>
          ))}
          <button onClick={()=>upd(groups.map(x=>x.id===g.id?{...x,options:[...x.options,{name:"Nova opção",price:0}]}:x))} style={{background:"#fff",border:"2px dashed #D4C5B0",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,color:"#9B8B7A",width:"100%"}}>+ Adicionar opção</button>
        </div>
      ))}
      <button onClick={()=>upd([...groups,{id:Date.now(),title:"Novo Complemento",options:[],max:1}])} style={{background:"#8B1A1A",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:700,width:"100%"}}>+ Novo grupo de complementos</button>
    </div>
  );
}

const P_FORM_IS={width:"100%",border:"2px solid #E5DDD5",borderRadius:10,padding:"10px 14px",outline:"none",fontSize:14,marginBottom:12};

function PForm({data,setData,onSave,onCancel,title,categories,saving}){
  const catList = [...categories].sort((a,b)=>a.order-b.order);
  return(
    <div style={{background:"#fff",borderRadius:16,padding:24,marginBottom:20,boxShadow:"0 4px 24px rgba(0,0,0,0.1)"}}>
      <h3 style={{fontWeight:800,marginBottom:16}}>{title}</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:4}}>Nome *</label><input value={data.name} onChange={e=>setData(p=>({...p,name:e.target.value}))} style={P_FORM_IS} /></div>
        <div><label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:4}}>Preço *</label><input value={data.price} onChange={e=>setData(p=>({...p,price:e.target.value}))} style={P_FORM_IS} /></div>
      </div>
      <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:4}}>Categoria</label>
      <select value={data.category||catList[0]?.name||""} onChange={e=>setData(p=>({...p,category:e.target.value}))} style={P_FORM_IS}>
        {catList.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:4}}>Tag</label>
      <select value={data.tag||""} onChange={e=>setData(p=>({...p,tag:e.target.value||null}))} style={P_FORM_IS}>
        <option value="">Sem tag</option><option value="bestseller">Mais Vendido</option><option value="new">Novo</option><option value="promo">Promoção</option>
      </select>
      <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:4}}>Descrição</label>
      <textarea value={data.description} onChange={e=>setData(p=>({...p,description:e.target.value}))} style={{...P_FORM_IS,height:70,resize:"none"}} />
      <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:8}}>Foto do produto</label>
      <ImageUpload value={data.image} onChange={img=>setData(p=>({...p,image:img}))} style={{marginBottom:16}} />
      <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:8}}>Complementos</label>
      <ComplementEditor value={data.complements||"[]"} onChange={val=>setData(p=>({...p,complements:val}))} />
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <button onClick={onSave} disabled={saving} style={{background:"#8B1A1A",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,cursor:"pointer",flex:1}}>{saving?"Salvando...":"Salvar"}</button>
        <button onClick={onCancel} style={{background:"#F5F0EB",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,cursor:"pointer"}}>Cancelar</button>
      </div>
    </div>
  );
}

function AdminArea({ products, setProducts, store, setStore, categories, setCategories }) {
  const [section,setSection]=useState("products");
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [notif,setNotif]=useState(null);
  const [editingProduct,setEditingProduct]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newP,setNewP]=useState({name:"",price:"",category:"",description:"",image:"",tag:"",complements:"[]"});
  const [saving,setSaving]=useState(false);
  const [editCat,setEditCat]=useState(null);
  const [newCatName,setNewCatName]=useState("");

  function notify(msg,type="success"){setNotif({msg,type});setTimeout(()=>setNotif(null),3000);}

  async function toggleProduct(id,current){
    await db("products","PATCH",{active:!current},`?id=eq.${id}`);
    setProducts(prev=>prev.map(p=>p.id===id?{...p,active:!current}:p));
    notify("Produto atualizado!");
  }
  async function toggleSoldOut(id,current){
    try{
      await db("products","PATCH",{sold_out:!current},`?id=eq.${id}`);
      setProducts(prev=>prev.map(p=>p.id===id?{...p,sold_out:!current}:p));
      notify(!current?"Produto marcado como esgotado!":"Produto marcado como disponível!");
    }catch(e){
      console.error(e);
      notify("Erro ao atualizar. Veja o console (F12).","error");
    }
  }
  async function deleteProduct(id){
    if(!confirm("Tem certeza?"))return;
    await db("products","DELETE",null,`?id=eq.${id}`);
    setProducts(prev=>prev.filter(p=>p.id!==id));
    notify("Produto removido!");
  }
  async function saveNewProduct(){
    if(!newP.name||!newP.price)return notify("Preencha nome e preço!","error");
    setSaving(true);
    try{
      const cat = newP.category||([...categories].sort((a,b)=>a.order-b.order)[0]?.name||"Geral");
      const sameCog = products.filter(p=>p.category===cat);
      const nextPos = sameCog.length>0?Math.max(...sameCog.map(p=>p.position||0))+1:1;
      const result=await db("products","POST",{...newP,price:parseFloat(newP.price),active:true,position:nextPos,image:newP.image||"https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80",category:cat});
      if(!result||!result[0])throw new Error("Resposta vazia do servidor");
      setProducts(prev=>[...prev,result[0]]);
      setShowAdd(false);
      setNewP({name:"",price:"",category:"",description:"",image:"",tag:"",complements:"[]"});
      notify("Produto adicionado!");
    }catch(e){
      console.error(e);
      notify("Erro ao salvar produto. Veja o console (F12).","error");
    }
    setSaving(false);
  }
  async function saveEditProduct(){
    if(!editingProduct.name||!editingProduct.price)return notify("Preencha nome e preço!","error");
    setSaving(true);
    try{
      const {id,created_at,...data}=editingProduct;
      await db("products","PATCH",{...data,price:parseFloat(data.price)},`?id=eq.${id}`);
      setProducts(prev=>prev.map(p=>p.id===id?{...editingProduct,price:parseFloat(editingProduct.price)}:p));
      setEditingProduct(null);
      notify("Produto salvo!");
    }catch(e){
      console.error(e);
      notify("Erro ao salvar produto. Veja o console (F12).","error");
    }
    setSaving(false);
  }
  async function moveProductUp(id){
    const cat=products.find(p=>p.id===id)?.category;
    const s=[...products].filter(p=>p.category===cat).sort((a,b)=>(a.position||0)-(b.position||0));
    const i=s.findIndex(p=>p.id===id);
    if(i<=0)return;
    const a=s[i],b=s[i-1];
    const posA=a.position||0,posB=b.position||0;
    setProducts(prev=>prev.map(p=>p.id===a.id?{...p,position:posB}:p.id===b.id?{...p,position:posA}:p));
    try{
      await Promise.all([
        db("products","PATCH",{position:posB},`?id=eq.${a.id}`),
        db("products","PATCH",{position:posA},`?id=eq.${b.id}`),
      ]);
    }catch(e){console.error(e);notify("Erro ao reordenar produto.","error");}
  }
  async function moveProductDown(id){
    const cat=products.find(p=>p.id===id)?.category;
    const s=[...products].filter(p=>p.category===cat).sort((a,b)=>(a.position||0)-(b.position||0));
    const i=s.findIndex(p=>p.id===id);
    if(i>=s.length-1)return;
    const a=s[i],b=s[i+1];
    const posA=a.position||0,posB=b.position||0;
    setProducts(prev=>prev.map(p=>p.id===a.id?{...p,position:posB}:p.id===b.id?{...p,position:posA}:p));
    try{
      await Promise.all([
        db("products","PATCH",{position:posB},`?id=eq.${a.id}`),
        db("products","PATCH",{position:posA},`?id=eq.${b.id}`),
      ]);
    }catch(e){console.error(e);notify("Erro ao reordenar produto.","error");}
  }
  async function saveStore(){
    setSaving(true);
    try{
      const {id,...data}=store;
      await db("store","PATCH",data,"?id=eq.1");
      notify("Loja salva!");
    }catch(e){
      console.error(e);
      notify("Erro ao salvar loja. Veja o console (F12).","error");
    }
    setSaving(false);
  }
  async function toggleStore(){
    const v=!store.is_open;
    await db("store","PATCH",{is_open:v},"?id=eq.1");
    setStore(p=>({...p,is_open:v}));
    notify(v?"Loja aberta!":"Loja fechada!");
  }

  async function addCategory(){
    if(!newCatName.trim())return;
    try{
      const result=await db("categories","POST",{name:newCatName.trim(),sort_order:categories.length+1});
      if(!result||!result[0])throw new Error("Resposta vazia do servidor");
      setCategories(prev=>[...prev,{id:result[0].id,name:result[0].name,order:result[0].sort_order}]);
      setNewCatName("");
      notify("Categoria adicionada!");
    }catch(e){
      console.error(e);
      notify("Erro ao salvar categoria. Veja o console (F12).","error");
    }
  }
  async function deleteCategory(id){
    try{
      await db("categories","DELETE",null,`?id=eq.${id}`);
      setCategories(prev=>prev.filter(c=>c.id!==id));
      notify("Categoria removida!");
    }catch(e){
      console.error(e);
      notify("Erro ao remover categoria. Veja o console (F12).","error");
    }
  }
  async function renameCategory(id,name){
    try{
      await db("categories","PATCH",{name},`?id=eq.${id}`);
    }catch(e){
      console.error(e);
      notify("Erro ao renomear categoria. Veja o console (F12).","error");
    }
  }
  async function moveUp(id){
    const s=[...categories].sort((a,b)=>a.order-b.order);
    const i=s.findIndex(c=>c.id===id);
    if(i<=0)return;
    const a=s[i],b=s[i-1];
    setCategories(prev=>prev.map(c=>c.id===a.id?{...c,order:b.order}:c.id===b.id?{...c,order:a.order}:c));
    try{
      await Promise.all([
        db("categories","PATCH",{sort_order:b.order},`?id=eq.${a.id}`),
        db("categories","PATCH",{sort_order:a.order},`?id=eq.${b.id}`),
      ]);
    }catch(e){console.error(e);notify("Erro ao reordenar. Veja o console (F12).","error");}
  }
  async function moveDown(id){
    const s=[...categories].sort((a,b)=>a.order-b.order);
    const i=s.findIndex(c=>c.id===id);
    if(i>=s.length-1)return;
    const a=s[i],b=s[i+1];
    setCategories(prev=>prev.map(c=>c.id===a.id?{...c,order:b.order}:c.id===b.id?{...c,order:a.order}:c));
    try{
      await Promise.all([
        db("categories","PATCH",{sort_order:b.order},`?id=eq.${a.id}`),
        db("categories","PATCH",{sort_order:a.order},`?id=eq.${b.id}`),
      ]);
    }catch(e){console.error(e);notify("Erro ao reordenar. Veja o console (F12).","error");}
  }

  const IS={width:"100%",border:"2px solid #E5DDD5",borderRadius:10,padding:"10px 14px",outline:"none",fontSize:14,marginBottom:12};
  const MENU=[{id:"products",icon:"🍔",label:"Produtos"},{id:"categories",icon:"📂",label:"Categorias"},{id:"store",icon:"🏪",label:"Minha Loja"},{id:"orders",icon:"📱",label:"Pedidos"}];

  return(
    <div style={{display:"flex",height:"100vh",background:"#F5F0EB",overflow:"hidden"}}>
      <style>{globalStyles}</style>
      {notif&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,background:notif.type==="success"?"#2ECC71":"#EF4444",color:"#fff",padding:"12px 20px",borderRadius:12,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>{notif.msg}</div>}
      <div style={{width:sidebarOpen?220:60,background:"#1A0A0A",display:"flex",flexDirection:"column",transition:"width 0.3s",overflow:"hidden",flexShrink:0}}>
        <div style={{padding:"18px 14px",borderBottom:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:"#8B1A1A",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🍗</div>
          {sidebarOpen&&<span className="st" style={{color:"#fff",fontSize:16,whiteSpace:"nowrap"}}>Admin</span>}
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#fff",cursor:"pointer",fontSize:16,flexShrink:0}}>{sidebarOpen?"◁":"▷"}</button>
        </div>
        <nav style={{flex:1,padding:"10px 6px"}}>
          {MENU.map(item=>(
            <button key={item.id} onClick={()=>setSection(item.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 10px",borderRadius:10,border:"none",cursor:"pointer",background:section===item.id?"#8B1A1A":"transparent",color:section===item.id?"#fff":"rgba(255,255,255,0.6)",fontWeight:section===item.id?700:400,marginBottom:3,textAlign:"left"}}>
              <span style={{fontSize:18,flexShrink:0}}>{item.icon}</span>
              {sidebarOpen&&<span style={{fontSize:13,whiteSpace:"nowrap"}}>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 6px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <button onClick={toggleStore} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 10px",borderRadius:10,border:"none",cursor:"pointer",background:store.is_open?"rgba(46,204,113,0.2)":"rgba(239,68,68,0.2)",color:store.is_open?"#2ECC71":"#EF4444",fontWeight:700}}>
            <span style={{fontSize:18,flexShrink:0}}>{store.is_open?"🟢":"🔴"}</span>
            {sidebarOpen&&<span style={{fontSize:13}}>{store.is_open?"Loja Aberta":"Loja Fechada"}</span>}
          </button>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto"}}>
        <div style={{background:"#fff",padding:"16px 24px",borderBottom:"1px solid #E5DDD5",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
          <h2 style={{fontWeight:800,fontSize:18}}>{MENU.find(m=>m.id===section)?.icon} {MENU.find(m=>m.id===section)?.label}</h2>
          <div style={{background:store.is_open?"#2ECC71":"#EF4444",color:"#fff",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700}}>{store.is_open?"● Aberta":"● Fechada"}</div>
        </div>
        <div style={{padding:24}}>

          {section==="products"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <p style={{color:"#9B8B7A",fontSize:14}}>{products.length} produtos</p>
                <button onClick={()=>setShowAdd(true)} style={{background:"#8B1A1A",color:"#fff",border:"none",borderRadius:12,padding:"10px 20px",fontWeight:700,cursor:"pointer"}}>+ Novo Produto</button>
              </div>
              {showAdd&&<PForm data={newP} setData={setNewP} onSave={saveNewProduct} onCancel={()=>setShowAdd(false)} title="Novo Produto" categories={categories} saving={saving} />}
              {editingProduct&&(
                <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,overflowY:"auto"}} onClick={()=>setEditingProduct(null)}>
                  <div style={{background:"#fff",borderRadius:20,padding:28,width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
                    <PForm data={editingProduct} setData={setEditingProduct} onSave={saveEditProduct} onCancel={()=>setEditingProduct(null)} title="Editar Produto" categories={categories} saving={saving} />
                  </div>
                </div>
              )}
              {[...categories].sort((a,b)=>a.order-b.order).map(cat=>{
                const catProducts=[...products].filter(p=>p.category===cat.name).sort((a,b)=>(a.position||0)-(b.position||0));
                if(catProducts.length===0)return null;
                return (
                  <div key={cat.id} style={{marginBottom:28}}>
                    <h3 style={{fontWeight:800,fontSize:16,color:"#8B1A1A",marginBottom:12,paddingBottom:6,borderBottom:"2px solid #E5DDD5"}}>{cat.name}</h3>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:14}}>
                      {catProducts.map((p,idx)=>(
                        <div key={p.id} style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",opacity:p.active?1:0.55}}>
                          <div style={{position:"relative",height:150}}>
                            <img src={p.image} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                            {p.tag&&<div style={{position:"absolute",top:8,left:8}}><Badge tag={p.tag} /></div>}
                            <div style={{position:"absolute",top:8,right:8,display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                              <div style={{background:p.active?"#2ECC71":"#EF4444",color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{p.active?"Ativo":"Oculto"}</div>
                              {p.sold_out&&<div style={{background:"#1A1A1A",color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>Esgotado</div>}
                            </div>
                          </div>
                          <div style={{padding:14}}>
                            <h4 style={{fontWeight:700,marginBottom:2,fontSize:14}}>{p.name}</h4>
                            <p style={{fontSize:12,color:"#9B8B7A",marginBottom:8}}>{p.category}</p>
                            <p className="st" style={{fontSize:16,color:"#8B1A1A",marginBottom:12}}>R$ {Number(p.price).toFixed(2)}</p>
                            <div style={{display:"flex",gap:8,marginBottom:8}}>
                              <button onClick={()=>moveProductUp(p.id)} disabled={idx===0} style={{flex:1,background:"#F5F0EB",border:"none",borderRadius:8,padding:7,fontSize:12,fontWeight:700,cursor:idx===0?"default":"pointer",opacity:idx===0?0.4:1}}>↑ Subir</button>
                              <button onClick={()=>moveProductDown(p.id)} disabled={idx===catProducts.length-1} style={{flex:1,background:"#F5F0EB",border:"none",borderRadius:8,padding:7,fontSize:12,fontWeight:700,cursor:idx===catProducts.length-1?"default":"pointer",opacity:idx===catProducts.length-1?0.4:1}}>↓ Descer</button>
                            </div>
                            <div style={{display:"flex",gap:8,marginBottom:8}}>
                              <button onClick={()=>toggleSoldOut(p.id,p.sold_out)} style={{flex:1,background:p.sold_out?"#1A1A1A":"#F5F0EB",color:p.sold_out?"#fff":"#1A1A1A",border:"none",borderRadius:8,padding:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>{p.sold_out?"Marcar disponível":"Marcar esgotado"}</button>
                            </div>
                            <div style={{display:"flex",gap:8}}>
                              <button onClick={()=>setEditingProduct({...p,complements:p.complements||"[]"})} style={{flex:1,background:"#EFF6FF",border:"none",borderRadius:8,padding:7,fontSize:12,fontWeight:700,cursor:"pointer",color:"#1D4ED8"}}>✏️ Editar</button>
                              <button onClick={()=>toggleProduct(p.id,p.active)} style={{flex:1,background:p.active?"#FEE2E2":"#D1FAE5",border:"none",borderRadius:8,padding:7,fontSize:12,fontWeight:700,cursor:"pointer",color:p.active?"#991B1B":"#065F46"}}>{p.active?"Ocultar":"Ativar"}</button>
                              <button onClick={()=>deleteProduct(p.id)} style={{background:"#F5F0EB",border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer"}}>🗑️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {products.filter(p=>!categories.some(c=>c.name===p.category)).length>0&&(
                <div style={{marginBottom:28}}>
                  <h3 style={{fontWeight:800,fontSize:16,color:"#9B8B7A",marginBottom:12,paddingBottom:6,borderBottom:"2px solid #E5DDD5"}}>Sem categoria</h3>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:14}}>
                    {products.filter(p=>!categories.some(c=>c.name===p.category)).map(p=>(
                      <div key={p.id} style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",opacity:p.active?1:0.55}}>
                        <div style={{position:"relative",height:150}}>
                          <img src={p.image} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                          {p.tag&&<div style={{position:"absolute",top:8,left:8}}><Badge tag={p.tag} /></div>}
                          <div style={{position:"absolute",top:8,right:8,display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                            <div style={{background:p.active?"#2ECC71":"#EF4444",color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{p.active?"Ativo":"Oculto"}</div>
                            {p.sold_out&&<div style={{background:"#1A1A1A",color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>Esgotado</div>}
                          </div>
                        </div>
                        <div style={{padding:14}}>
                          <h4 style={{fontWeight:700,marginBottom:2,fontSize:14}}>{p.name}</h4>
                          <p style={{fontSize:12,color:"#9B8B7A",marginBottom:8}}>{p.category}</p>
                          <p className="st" style={{fontSize:16,color:"#8B1A1A",marginBottom:12}}>R$ {Number(p.price).toFixed(2)}</p>
                          <div style={{display:"flex",gap:8,marginBottom:8}}>
                            <button onClick={()=>toggleSoldOut(p.id,p.sold_out)} style={{flex:1,background:p.sold_out?"#1A1A1A":"#F5F0EB",color:p.sold_out?"#fff":"#1A1A1A",border:"none",borderRadius:8,padding:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>{p.sold_out?"Marcar disponível":"Marcar esgotado"}</button>
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>setEditingProduct({...p,complements:p.complements||"[]"})} style={{flex:1,background:"#EFF6FF",border:"none",borderRadius:8,padding:7,fontSize:12,fontWeight:700,cursor:"pointer",color:"#1D4ED8"}}>✏️ Editar</button>
                            <button onClick={()=>toggleProduct(p.id,p.active)} style={{flex:1,background:p.active?"#FEE2E2":"#D1FAE5",border:"none",borderRadius:8,padding:7,fontSize:12,fontWeight:700,cursor:"pointer",color:p.active?"#991B1B":"#065F46"}}>{p.active?"Ocultar":"Ativar"}</button>
                            <button onClick={()=>deleteProduct(p.id)} style={{background:"#F5F0EB",border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer"}}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {section==="categories"&&(
            <div style={{maxWidth:500}}>
              <div style={{background:"#fff",borderRadius:16,padding:24,marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontWeight:800,marginBottom:16}}>Adicionar Categoria</h3>
                <div style={{display:"flex",gap:10}}>
                  <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="Ex: 🍕 Pizzas" style={{flex:1,border:"2px solid #E5DDD5",borderRadius:10,padding:"10px 14px",outline:"none",fontSize:14}} onKeyDown={e=>e.key==="Enter"&&addCategory()} onFocus={e=>e.target.style.borderColor="#8B1A1A"} onBlur={e=>e.target.style.borderColor="#E5DDD5"} />
                  <button onClick={addCategory} style={{background:"#8B1A1A",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,cursor:"pointer"}}>Adicionar</button>
                </div>
                <p style={{fontSize:12,color:"#9B8B7A",marginTop:8}}>Dica: use emojis no nome. Ex: 🍕 Pizzas, 🌮 Tacos</p>
              </div>
              <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontWeight:800,marginBottom:16}}>Categorias ({categories.length})</h3>
                {[...categories].sort((a,b)=>a.order-b.order).map(cat=>(
                  <div key={cat.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:"1px solid #F5F0EB"}}>
                    {editCat===cat.id?(
                      <input value={cat.name} onChange={e=>setCategories(prev=>prev.map(c=>c.id===cat.id?{...c,name:e.target.value}:c))} style={{flex:1,border:"2px solid #8B1A1A",borderRadius:8,padding:"6px 12px",outline:"none",fontSize:14}} onBlur={()=>{setEditCat(null);renameCategory(cat.id,cat.name);}} onKeyDown={e=>e.key==="Enter"&&setEditCat(null)} autoFocus />
                    ):(
                      <span style={{flex:1,fontWeight:600,fontSize:15}}>{cat.name}</span>
                    )}
                    <button onClick={()=>setEditCat(cat.id)} style={{background:"#EFF6FF",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:13,color:"#1D4ED8",fontWeight:700}}>✏️</button>
                    <button onClick={()=>moveUp(cat.id)} style={{background:"#F5F0EB",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>↑</button>
                    <button onClick={()=>moveDown(cat.id)} style={{background:"#F5F0EB",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>↓</button>
                    <button onClick={()=>deleteCategory(cat.id)} style={{background:"#FEE2E2",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#991B1B",fontWeight:700}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section==="store"&&(
            <div style={{maxWidth:600}}>
              <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",marginBottom:20}}>
                <h3 style={{fontWeight:800,marginBottom:20}}>🏪 Informações</h3>
                {[["name","Nome da Loja"],["slogan","Slogan"],["category","Categoria"],["delivery_time","Tempo de Entrega"],["prep_time","Tempo de Preparo"]].map(([f,l])=>(
                  <div key={f} style={{marginBottom:14}}>
                    <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>{l}</label>
                    <input value={store[f]||""} onChange={e=>setStore(p=>({...p,[f]:e.target.value}))} style={IS} />
                  </div>
                ))}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                  <div><label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Taxa de Entrega (R$)</label><input type="number" step="0.01" value={store.delivery_fee} onChange={e=>setStore(p=>({...p,delivery_fee:e.target.value}))} style={IS} /></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Pedido Mínimo (R$)</label><input type="number" step="0.01" value={store.min_order} onChange={e=>setStore(p=>({...p,min_order:e.target.value}))} style={IS} /></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>🕐 Abre às</label><input type="time" value={store.open_time||"18:30"} onChange={e=>setStore(p=>({...p,open_time:e.target.value}))} style={IS} /></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>🕐 Fecha às</label><input type="time" value={store.close_time||"23:30"} onChange={e=>setStore(p=>({...p,close_time:e.target.value}))} style={IS} /></div>
                </div>
                <div style={{marginTop:14}}>
                  <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:8}}>📅 Dias de funcionamento</label>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {WEEKDAYS.map(d=>{
                      const openDays=(store.open_days||"0,1,2,3,4,5,6").split(",").map(Number);
                      const active=openDays.includes(d.val);
                      return (
                        <button key={d.val} onClick={()=>{
                          const current=(store.open_days||"0,1,2,3,4,5,6").split(",").map(Number).filter(n=>!isNaN(n));
                          const updated=current.includes(d.val)?current.filter(v=>v!==d.val):[...current,d.val];
                          setStore(p=>({...p,open_days:updated.sort().join(",")}));
                        }} style={{padding:"10px 14px",borderRadius:10,border:`2px solid ${active?"#8B1A1A":"#E5DDD5"}`,background:active?"#8B1A1A":"#fff",color:active?"#fff":"#1A1A1A",fontWeight:700,cursor:"pointer",fontSize:13,minWidth:52}}>{d.label}</button>
                      );
                    })}
                  </div>
                  <p style={{fontSize:11,color:"#9B8B7A",marginTop:8}}>Clique para ativar/desativar cada dia. Ex: só Qua a Dom → desative Seg e Ter.</p>
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",marginBottom:20}}>
                <h3 style={{fontWeight:800,marginBottom:16}}>🎨 Aparência</h3>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Cor do nome</label>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <input type="color" value={store.title_color||"#8B1A1A"} onChange={e=>setStore(p=>({...p,title_color:e.target.value}))} style={{width:50,height:40,border:"none",borderRadius:8,cursor:"pointer"}} />
                    <input value={store.title_color||"#8B1A1A"} onChange={e=>setStore(p=>({...p,title_color:e.target.value}))} style={{flex:1,border:"2px solid #E5DDD5",borderRadius:10,padding:"10px 14px",outline:"none",fontSize:14}} />
                    <span className="st" style={{fontSize:20,color:store.title_color||"#8B1A1A"}}>{store.name}</span>
                  </div>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Formato da logo</label>
                  <div style={{display:"flex",gap:12}}>
                    {[["circle","⭕ Redonda"],["square","⬜ Quadrada"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setStore(p=>({...p,logo_shape:v}))} style={{flex:1,padding:10,borderRadius:12,border:`2px solid ${store.logo_shape===v?"#8B1A1A":"#E5DDD5"}`,background:store.logo_shape===v?"#FFF5F5":"#fff",fontWeight:700,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",marginBottom:20}}>
                <h3 style={{fontWeight:800,marginBottom:16}}>🖼️ Banner</h3>
                <ImageUpload value={store.banner?.startsWith("data:")?store.banner:null} onChange={img=>setStore(p=>({...p,banner:img}))} style={{marginBottom:12}} />
                <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Ou cole um link</label>
                <input placeholder="https://..." value={store.banner?.startsWith("data:")?"":store.banner||""} onChange={e=>setStore(p=>({...p,banner:e.target.value}))} style={IS} />
              </div>
              <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",marginBottom:20}}>
                <h3 style={{fontWeight:800,marginBottom:16}}>🏷️ Logo</h3>
                <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Emoji</label>
                <input placeholder="🍗" value={(store.logo?.startsWith("data:")||store.logo?.startsWith("http"))?"":store.logo||""} onChange={e=>setStore(p=>({...p,logo:e.target.value}))} style={{...IS,fontSize:24,textAlign:"center"}} />
                <label style={{fontSize:12,fontWeight:600,color:"#9B8B7A",display:"block",marginBottom:6}}>Ou faça upload (PNG recomendado)</label>
                <ImageUpload value={store.logo?.startsWith("data:")?store.logo:null} onChange={img=>setStore(p=>({...p,logo:img}))} />
                <p style={{fontSize:11,color:"#9B8B7A",marginTop:8}}>Ao enviar uma imagem, ela também aparece como o ícone da aba do navegador (favicon).</p>
              </div>
              <button onClick={saveStore} disabled={saving} style={{width:"100%",background:"#8B1A1A",color:"#fff",border:"none",borderRadius:14,padding:16,fontWeight:800,fontSize:16,cursor:"pointer",marginBottom:16}}>
                {saving?"Salvando...":"💾 Salvar Alterações"}
              </button>
              <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontWeight:800,marginBottom:12}}>🔴🟢 Status</h3>
                <button onClick={toggleStore} style={{background:store.is_open?"#FEE2E2":"#D1FAE5",border:"none",borderRadius:12,padding:"14px 28px",fontWeight:800,cursor:"pointer",fontSize:15,color:store.is_open?"#991B1B":"#065F46"}}>
                  {store.is_open?"🔴 Fechar a Loja":"🟢 Abrir a Loja"}
                </button>
              </div>
            </div>
          )}

          {section==="orders"&&(
            <div style={{textAlign:"center",padding:60,color:"#9B8B7A"}}>
              <div style={{fontSize:48,marginBottom:12}}>📱</div>
              <p style={{fontWeight:700,fontSize:18,marginBottom:12}}>Pedidos via WhatsApp</p>
              <p style={{fontSize:14,maxWidth:400,margin:"0 auto",lineHeight:1.7}}>Quando um cliente finaliza o pedido, você recebe no <strong style={{color:"#8B1A1A"}}>WhatsApp (21) 97701-6114</strong> com todos os detalhes: nome, endereço, link do Maps, itens e total.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [pwd,setPwd]=useState("");
  const [error,setError]=useState(false);
  function tryLogin(){
    if(pwd===ADMIN_PASSWORD){onLogin();}
    else{setError(true);setTimeout(()=>setError(false),2000);setPwd("");}
  }
  return(
    <div style={{minHeight:"100vh",background:"#1A0A0A",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{globalStyles}</style>
      <div style={{background:"#fff",borderRadius:20,padding:40,width:"100%",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{width:64,height:64,background:"#8B1A1A",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 20px"}}>🍗</div>
        <h2 className="st" style={{fontSize:26,marginBottom:6,color:"#8B1A1A"}}>Portal Admin</h2>
        <p style={{color:"#9B8B7A",fontSize:14,marginBottom:28}}>Billy Chicken — Acesso restrito</p>
        <input type="password" placeholder="Digite a senha" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()} style={{width:"100%",border:`2px solid ${error?"#EF4444":"#E5DDD5"}`,borderRadius:12,padding:"13px 16px",fontSize:15,outline:"none",marginBottom:14,textAlign:"center",letterSpacing:4}} />
        {error&&<p style={{color:"#EF4444",fontSize:13,marginBottom:10}}>Senha incorreta!</p>}
        <button onClick={tryLogin} style={{width:"100%",background:"#8B1A1A",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:15,cursor:"pointer"}}>Entrar →</button>
      </div>
    </div>
  );
}

export default function App() {
  const [products,setProducts]=useState([]);
  const [store,setStore]=useState(DEFAULT_STORE);
  const [categories,setCategories]=useState(DEFAULT_CATEGORIES);
  const [loading,setLoading]=useState(true);
  const [adminLoggedIn,setAdminLoggedIn]=useState(false);
  const [customerUser,setCustomerUser]=useState(null);
  const [showAuth,setShowAuth]=useState(false);
  const isAdmin=window.location.pathname==="/admin"||window.location.hash==="#admin";

  useEffect(()=>{
    document.title = store.name || "Cardápio";
    const isImageLogo = store.logo && (store.logo.startsWith("data:")||store.logo.startsWith("http"));
    if(isImageLogo){
      // Detect real mime type instead of assuming PNG, or the browser silently ignores the icon
      let mime = "image/png";
      const dataMatch = store.logo.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
      if(dataMatch){
        mime = dataMatch[1];
      }else if(store.logo.startsWith("http")){
        const ext = store.logo.split("?")[0].split(".").pop().toLowerCase();
        if(ext==="jpg"||ext==="jpeg")mime="image/jpeg";
        else if(ext==="svg")mime="image/svg+xml";
        else if(ext==="gif")mime="image/gif";
        else if(ext==="webp")mime="image/webp";
        else mime="image/png";
      }
      // Remove any existing icon links so browsers that cache aggressively pick up the new one
      document.querySelectorAll("link[rel*='icon']").forEach(el=>el.remove());
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = mime;
      link.href = store.logo;
      document.head.appendChild(link);
    }
  },[store.name, store.logo]);

  useEffect(()=>{
    // Check saved user
    try {
      const saved = localStorage.getItem("billy_current_user");
      if(saved) setCustomerUser(JSON.parse(saved));
    } catch {}

    async function load(){
      try{
        const [sd,pd,cd]=await Promise.all([
          db("store","GET",null,"?id=eq.1"),
          db("products","GET",null,"?order=category.asc,position.asc,id.asc"),
          db("categories","GET",null,"?order=sort_order.asc"),
        ]);
        if(sd?.[0])setStore(sd[0]);
        if(pd?.length>0){
          setProducts(pd);
        }else{
          const INITIAL=[
            {name:"Billy Clássico",category:"🍔 Hambúrgueres",price:32.9,description:"Blend de frango artesanal, queijo cheddar, alface, tomate, cebola e molho especial Billy.",image:"https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80",tag:"bestseller",active:true,position:1,complements:JSON.stringify([{id:1,title:"Adicionar Molhos",options:[{name:"Molho Barbecue",price:2},{name:"Molho Ranch",price:2},{name:"Molho Chipotle",price:2}],max:2}])},
            {name:"Billy Bacon Crocante",category:"🍔 Hambúrgueres",price:39.9,description:"Blend especial, bacon crocante, queijo coalho, cebola caramelizada e maionese defumada.",image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",tag:"new",active:true,position:2,complements:JSON.stringify([])},
            {name:"Combo Billy Família",category:"🍗 Combos",price:89.9,description:"2 Billy Clássico + 1 Billy Bacon + 2 Batatas Grandes + 4 Refrigerantes 350ml.",image:"https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400&q=80",tag:"promo",active:true,position:1,complements:JSON.stringify([])},
            {name:"Batata Frita Rústica",category:"🍟 Acompanhamentos",price:18.9,description:"Batatas rústicas temperadas com ervas e flor de sal.",image:"https://images.unsplash.com/photo-1529990098630-4022df7bb7cc?w=400&q=80",tag:null,active:true,position:1,complements:JSON.stringify([{id:1,title:"Escolha o Molho",options:[{name:"Ketchup",price:0},{name:"Cheddar",price:3}],max:1}])},
            {name:"Coca-Cola 350ml",category:"🥤 Bebidas",price:7.9,description:"Coca-Cola gelada.",image:"https://images.unsplash.com/photo-1629203851122-3726555cf519?w=400&q=80",tag:null,active:true,position:1,complements:JSON.stringify([])},
            {name:"Brownie com Sorvete",category:"🍰 Sobremesas",price:19.9,description:"Brownie quentinho com sorvete de creme e calda de chocolate.",image:"https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80",tag:"new",active:true,position:1,complements:JSON.stringify([])},
          ];
          for(const p of INITIAL)await db("products","POST",p);
          const fresh=await db("products","GET",null,"?order=category.asc,position.asc,id.asc");
          setProducts(fresh||[]);
        }
        if(cd?.length>0){
          setCategories(cd.map(c=>({id:c.id,name:c.name,order:c.sort_order})));
        }else{
          for(const c of DEFAULT_CATEGORIES)await db("categories","POST",{name:c.name,sort_order:c.order});
          const freshCats=await db("categories","GET",null,"?order=sort_order.asc");
          setCategories((freshCats||[]).map(c=>({id:c.id,name:c.name,order:c.sort_order})));
        }
      }catch(e){console.error(e);}
      setLoading(false);
    }
    load();
  },[]);

  if(loading)return <Spinner />;

  if(isAdmin){
    if(!adminLoggedIn)return <AdminLogin onLogin={()=>setAdminLoggedIn(true)} />;
    return <AdminArea products={products} setProducts={setProducts} store={store} setStore={setStore} categories={categories} setCategories={setCategories} />;
  }

  if(showAuth) return <CustomerAuth onLogin={(user)=>{setCustomerUser(user);setShowAuth(false);}} />;

  return <CustomerArea products={products} store={store} categories={categories} user={customerUser} onLogout={()=>{setCustomerUser(null);setShowAuth(true);}} />;
}
