import { useState, useRef } from "react";

const WHATSAPP_NUMBER = "5521977016114";
const ADMIN_PASSWORD = "admin123";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #F7F7F5; color: #1A1A1A; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F0F0EE; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  input, textarea, select { font-family: 'Inter', sans-serif; }
`;

const DEFAULT_STORE = {
  name: "Cardápio Fácil Brasil",
  category: "Delivery",
  phone: "21977016114",
  deliveryFee: 5.00,
  minOrder: 25.00,
  deliveryTime: "30–50 min",
  prepTime: "15–25 min",
  banner: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80",
  logo: "🍔",
  isOpen: true,
};

const INITIAL_PRODUCTS = [
  { id: 1, name: "Classic Smash Burger", category: "Hambúrgueres", price: 32.9, description: "Dois smash patties 90g, queijo cheddar, pickles, cebola roxa e molho especial.", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80", tag: "bestseller", active: true },
  { id: 2, name: "Double Bacon Crispy", category: "Hambúrgueres", price: 42.9, description: "Dupla blend especial, bacon crocante, queijo coalho, alface, tomate e maionese defumada.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", tag: "new", active: true },
  { id: 3, name: "Veggie Deluxe", category: "Hambúrgueres", price: 29.9, description: "Hambúrguer de grão-de-bico, queijo brie, rúcula, tomate seco e pesto.", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80", tag: null, active: true },
  { id: 4, name: "Batata Frita Rústica", category: "Acompanhamentos", price: 18.9, description: "Batatas rústicas temperadas com alecrim e flor de sal, com molho aioli.", image: "https://images.unsplash.com/photo-1529990098630-4022df7bb7cc?w=400&q=80", tag: "promo", active: true },
  { id: 5, name: "Onion Rings Premium", category: "Acompanhamentos", price: 22.9, description: "Anéis de cebola empanados em panko crocante com molho ranch.", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80", tag: null, active: true },
  { id: 6, name: "Milkshake Oreo", category: "Bebidas", price: 24.9, description: "Milkshake cremoso com sorvete de baunilha, biscoito Oreo e chantilly.", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", tag: "bestseller", active: true },
  { id: 7, name: "Coca-Cola 600ml", category: "Bebidas", price: 9.9, description: "Coca-Cola gelada.", image: "https://images.unsplash.com/photo-1629203851122-3726555cf519?w=400&q=80", tag: null, active: true },
  { id: 8, name: "Brownie com Sorvete", category: "Sobremesas", price: 19.9, description: "Brownie quentinho de chocolate belga com sorvete de baunilha e calda de caramelo.", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80", tag: "new", active: true },
  { id: 9, name: "Combo Família", category: "Combos", price: 89.9, description: "2 Classic Smash + 1 Double Bacon + 2 Batatas Grandes + 4 Refris 350ml.", image: "https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400&q=80", tag: "promo", active: true },
];

const TAG_COLORS = { bestseller: "#FF4D00", new: "#2ECC71", promo: "#FFE500" };
const TAG_LABELS = { bestseller: "Mais Vendido", new: "Novo", promo: "Promoção" };
const STATUS_FLOW = ["received", "accepted", "preparing", "delivering", "delivered"];
const STATUS_LABELS = { received: "Recebido", accepted: "Aceito", preparing: "Preparando", delivering: "A caminho", delivered: "Entregue" };
const STATUS_COLORS = { received: "#6B7280", accepted: "#3B82F6", preparing: "#F59E0B", delivering: "#8B5CF6", delivered: "#10B981" };
const CATEGORIES = ["Hambúrgueres", "Acompanhamentos", "Bebidas", "Sobremesas", "Combos"];

function Badge({ tag }) {
  if (!tag) return null;
  return <span style={{ background: TAG_COLORS[tag], color: tag === "promo" ? "#1A1A1A" : "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>{TAG_LABELS[tag]}</span>;
}

function ImageUpload({ value, onChange, style }) {
  const inputRef = useRef();
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  }
  return (
    <div style={{ position: "relative", ...style }}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      <div onClick={() => inputRef.current.click()} style={{ border: "2px dashed #F0F0EE", borderRadius: 12, padding: "14px", textAlign: "center", cursor: "pointer", background: "#F7F7F5", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#FF4D00"} onMouseLeave={e => e.currentTarget.style.borderColor = "#F0F0EE"}>
        {value ? <img src={value} alt="preview" style={{ maxHeight: 120, borderRadius: 8, objectFit: "cover", maxWidth: "100%" }} /> : <div><div style={{ fontSize: 28, marginBottom: 6 }}>📷</div><p style={{ fontSize: 13, color: "#6B7280" }}>Clique para escolher uma imagem</p></div>}
      </div>
    </div>
  );
}

// ─── CUSTOMER AREA ────────────────────────────────────────────────────────────
function CustomerArea({ products, store }) {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [step, setStep] = useState("menu");
  const [orderType, setOrderType] = useState("delivery");
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "", payment: "pix", change: "" });
  const [orderStatus, setOrderStatus] = useState(0);

  const activeProducts = products.filter(p => p.active);
  const categories = ["Todos", ...new Set(activeProducts.map(p => p.category))];
  const filtered = activeProducts.filter(p => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const total = cartTotal + (orderType === "delivery" ? store.deliveryFee : 0);

  function addToCart(p) {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }

  function sendWhatsApp() {
    if (!customerInfo.name || !customerInfo.phone) return alert("Preencha nome e telefone!");
    if (orderType === "delivery" && !customerInfo.address) return alert("Preencha o endereço!");

    const mapsLink = orderType === "delivery" ? `\n🗺️ *Ver no Maps:* https://maps.google.com/?q=${encodeURIComponent(customerInfo.address)}` : "";
    const items = cart.map(i => `• ${i.qty}x ${i.name} — R$ ${(i.price * i.qty).toFixed(2)}`).join("\n");
    const msg = `🛵 *NOVO PEDIDO*\n\n👤 *Cliente:* ${customerInfo.name}\n📱 *Telefone:* ${customerInfo.phone}\n${orderType === "delivery" ? `📍 *Endereço:* ${customerInfo.address}${mapsLink}\n` : "🏪 *Retirada no local*\n"}\n🛒 *Itens:*\n${items}\n\n💰 *Subtotal:* R$ ${cartTotal.toFixed(2)}${orderType === "delivery" ? `\n🛵 *Taxa de entrega:* R$ ${store.deliveryFee.toFixed(2)}` : ""}\n💵 *Total:* R$ ${total.toFixed(2)}\n💳 *Pagamento:* ${customerInfo.payment.toUpperCase()}${customerInfo.payment === "dinheiro" && customerInfo.change ? `\n💵 *Troco para:* R$ ${customerInfo.change}` : ""}\n📦 *Tipo:* ${orderType === "delivery" ? "Entrega" : "Retirada"}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setStep("tracking");
    setOrderStatus(0);
    setCart([]);
    setTimeout(() => setOrderStatus(1), 3000);
  }

  if (!store.isOpen) return (
    <div style={{ minHeight: "100vh", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 24, textAlign: "center" }}>
      <style>{globalStyles}</style>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🔴</div>
      <h1 style={{ fontFamily: "'Syne', sans-serif", color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{store.name}</h1>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>Estamos fechados no momento.<br />Volte em breve! 😊</p>
    </div>
  );

  if (step === "tracking") return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{globalStyles}</style>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🛵</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800 }}>Pedido enviado!</h1>
        <p style={{ color: "#6B7280", marginTop: 8 }}>Acompanhe o status abaixo</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 4px 30px rgba(0,0,0,0.08)", marginBottom: 24 }}>
        {STATUS_FLOW.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: i < 4 ? 20 : 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i <= orderStatus ? "#FF4D00" : "#F0F0EE", color: i <= orderStatus ? "#fff" : "#aaa", fontWeight: 800, fontSize: 14, flexShrink: 0, transition: "all 0.5s" }}>{i <= orderStatus ? "✓" : i + 1}</div>
            <span style={{ fontWeight: i === orderStatus ? 700 : 400, color: i <= orderStatus ? "#1A1A1A" : "#aaa" }}>{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>
      <button onClick={() => { setStep("menu"); setOrderStatus(0); }} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 15 }}>Fazer Novo Pedido</button>
    </div>
  );

  if (step === "checkout") return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5" }}>
      <style>{globalStyles}</style>
      <div style={{ background: "#1A1A1A", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setStep("menu")} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>←</button>
        <h2 style={{ fontFamily: "'Syne', sans-serif", color: "#fff", fontWeight: 800, fontSize: 18 }}>Finalizar Pedido</h2>
      </div>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>Tipo de pedido</h3>
          <div style={{ display: "flex", gap: 12 }}>
            {["delivery", "retirada"].map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `2px solid ${orderType === t ? "#FF4D00" : "#F0F0EE"}`, background: orderType === t ? "#FFF5F0" : "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                {t === "delivery" ? "🛵 Entrega" : "🏪 Retirada"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>Seus dados</h3>
          {[["name", "Seu nome *", "text"], ["phone", "Seu WhatsApp *", "tel"]].map(([field, label, type]) => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
              <input type={type} value={customerInfo[field]} onChange={e => setCustomerInfo(p => ({ ...p, [field]: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", outline: "none", fontSize: 14 }} />
            </div>
          ))}
          {orderType === "delivery" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Endereço completo *</label>
              <input type="text" placeholder="Rua, número, bairro, cidade" value={customerInfo.address} onChange={e => setCustomerInfo(p => ({ ...p, address: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", outline: "none", fontSize: 14, marginBottom: 8 }} />
              {customerInfo.address && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(customerInfo.address)}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#FF4D00", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  🗺️ Ver no Google Maps
                </a>
              )}
            </div>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>Pagamento</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["pix", "PIX"], ["cartao", "Cartão"], ["dinheiro", "Dinheiro"]].map(([val, label]) => (
              <button key={val} onClick={() => setCustomerInfo(p => ({ ...p, payment: val }))} style={{ padding: "10px 18px", borderRadius: 10, border: `2px solid ${customerInfo.payment === val ? "#FF4D00" : "#F0F0EE"}`, background: customerInfo.payment === val ? "#FFF5F0" : "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>{label}</button>
            ))}
          </div>
          {customerInfo.payment === "dinheiro" && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Troco para quanto?</label>
              <input type="number" placeholder="Ex: 100" value={customerInfo.change} onChange={e => setCustomerInfo(p => ({ ...p, change: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", outline: "none" }} />
            </div>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>Resumo</h3>
          {cart.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>{i.qty}x {i.name}</span>
              <span style={{ fontWeight: 600 }}>R$ {(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #F0F0EE", marginTop: 12, paddingTop: 12 }}>
            {orderType === "delivery" && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6, color: "#6B7280" }}><span>Taxa de entrega</span><span>R$ {store.deliveryFee.toFixed(2)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 16 }}><span>Total</span><span style={{ color: "#FF4D00" }}>R$ {total.toFixed(2)}</span></div>
          </div>
        </div>

        <button onClick={sendWhatsApp} style={{ width: "100%", background: "#25D366", color: "#fff", border: "none", borderRadius: 14, padding: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
          📱 Enviar pedido pelo WhatsApp
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5" }}>
      <style>{globalStyles}</style>
      <div style={{ position: "relative", height: 240 }}>
        <img src={store.banner} alt="banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.75))" }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ width: 56, height: 56, background: "#fff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: store.logo?.startsWith("data:") || store.logo?.startsWith("http") ? 0 : 30, overflow: "hidden" }}>
              {store.logo?.startsWith("data:") || store.logo?.startsWith("http") ? <img src={store.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : store.logo}
            </div>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>{store.name}</h1>
              <p style={{ fontSize: 13, opacity: 0.85 }}>{store.category}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 12, flexWrap: "wrap" }}>
            <span>🕐 {store.deliveryTime}</span>
            <span>⏱ Preparo: {store.prepTime}</span>
            <span>📦 Mín. R$ {Number(store.minOrder).toFixed(2)}</span>
            <span>🛵 R$ {Number(store.deliveryFee).toFixed(2)}</span>
            <span style={{ background: "#2ECC71", color: "#fff", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>● Aberto</span>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "14px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 12, padding: "11px 14px 11px 42px", fontSize: 14, outline: "none" }} onFocus={e => e.target.style.borderColor = "#FF4D00"} onBlur={e => e.target.style.borderColor = "#F0F0EE"} />
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid #F0F0EE", overflowX: "auto", whiteSpace: "nowrap", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "inline-flex", gap: 4, padding: "10px 0" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 16px", borderRadius: 24, border: "none", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, background: activeCategory === cat ? "#FF4D00" : "#F0F0EE", color: activeCategory === cat ? "#fff" : "#1A1A1A", transition: "all 0.2s", whiteSpace: "nowrap" }}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => setSelectedProduct(p)} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.12)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}>
              <div style={{ position: "relative", height: 190 }}>
                <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {p.tag && <div style={{ position: "absolute", top: 10, left: 10 }}><Badge tag={p.tag} /></div>}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{p.name}</h3>
                <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>{p.description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>R$ {p.price.toFixed(2)}</span>
                  <button onClick={e => { e.stopPropagation(); addToCart(p); }} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <button onClick={() => setShowCart(true)} style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#FF4D00", color: "#fff", border: "none", borderRadius: 14, padding: "15px 28px", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 8px 28px rgba(255,77,0,0.4)", display: "flex", alignItems: "center", gap: 12, zIndex: 200, whiteSpace: "nowrap" }}>
          <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "2px 10px", fontSize: 13 }}>{cartCount}</span>
          Ver Carrinho
          <span>R$ {cartTotal.toFixed(2)}</span>
        </button>
      )}

      {selectedProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setSelectedProduct(null)}>
          <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "relative", height: 260 }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setSelectedProduct(null)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800 }}>{selectedProduct.name}</h2>
                <Badge tag={selectedProduct.tag} />
              </div>
              <p style={{ color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>{selectedProduct.description}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>R$ {selectedProduct.price.toFixed(2)}</span>
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "13px 26px", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Adicionar ao Carrinho</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowCart(false)}>
          <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0EE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>Seu Carrinho</h2>
              <button onClick={() => setShowCart(false)} style={{ background: "#F0F0EE", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: "16px 24px" }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #F7F7F5" }}>
                  <img src={item.image} alt={item.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: 14 }}>{item.name}</p>
                    <p style={{ fontSize: 13, color: "#6B7280" }}>R$ {item.price.toFixed(2)}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <button onClick={() => changeQty(item.id, -1)} style={{ background: "#F0F0EE", border: "none", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontWeight: 700 }}>−</button>
                      <span style={{ fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)} style={{ background: "#FF4D00", color: "#fff", border: "none", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontWeight: 700 }}>+</button>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>R$ {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ background: "#F7F7F5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 15 }}><span>Subtotal</span><span style={{ color: "#FF4D00" }}>R$ {cartTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={() => { setShowCart(false); setStep("checkout"); }} style={{ width: "100%", background: "#FF4D00", color: "#fff", border: "none", borderRadius: 14, padding: 16, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Finalizar Pedido →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN AREA ───────────────────────────────────────────────────────────────
function AdminArea({ products, setProducts, store, setStore }) {
  const [section, setSection] = useState("orders");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notif, setNotif] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Hambúrgueres", description: "", image: "", tag: "" });

  function notify(msg, type = "success") {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  }

  function toggleProduct(id) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    notify("Produto atualizado!");
  }

  function deleteProduct(id) {
    if (!confirm("Tem certeza que quer excluir este produto?")) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    notify("Produto removido!");
  }

  function saveProduct() {
    if (!newProduct.name || !newProduct.price) return notify("Preencha nome e preço!", "error");
    setProducts(prev => [...prev, { id: Date.now(), ...newProduct, price: parseFloat(newProduct.price), active: true, image: newProduct.image || "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80" }]);
    setShowAddProduct(false);
    setNewProduct({ name: "", price: "", category: "Hambúrgueres", description: "", image: "", tag: "" });
    notify("Produto adicionado!");
  }

  function saveEditProduct() {
    if (!editingProduct.name || !editingProduct.price) return notify("Preencha nome e preço!", "error");
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...editingProduct, price: parseFloat(editingProduct.price) } : p));
    setEditingProduct(null);
    notify("Produto salvo!");
  }

  function updateStore(field, value) {
    setStore(prev => ({ ...prev, [field]: value }));
  }

  const MENU = [
    { id: "orders", icon: "📋", label: "Pedidos" },
    { id: "products", icon: "🍔", label: "Produtos" },
    { id: "store", icon: "🏪", label: "Minha Loja" },
  ];

  const inputStyle = { width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", outline: "none", fontSize: 14, marginBottom: 12 };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F7F7F5", overflow: "hidden" }}>
      <style>{globalStyles}</style>

      {notif && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: notif.type === "success" ? "#2ECC71" : "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>{notif.msg}</div>}

      <div style={{ width: sidebarOpen ? 220 : 60, background: "#1A1A1A", color: "#fff", display: "flex", flexDirection: "column", transition: "width 0.3s", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "18px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "#FF4D00", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🍔</div>
          {sidebarOpen && <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>{sidebarOpen ? "◁" : "▷"}</button>
        </div>
        <nav style={{ flex: 1, padding: "10px 6px" }}>
          {MENU.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: section === item.id ? "#FF4D00" : "transparent", color: section === item.id ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: section === item.id ? 700 : 400, marginBottom: 3, transition: "all 0.2s", textAlign: "left" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 6px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={() => { setStore(p => ({ ...p, isOpen: !p.isOpen })); notify(store.isOpen ? "Loja fechada!" : "Loja aberta!"); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: store.isOpen ? "rgba(46,204,113,0.2)" : "rgba(239,68,68,0.2)", color: store.isOpen ? "#2ECC71" : "#EF4444", fontWeight: 700, transition: "all 0.2s" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{store.isOpen ? "🟢" : "🔴"}</span>
            {sidebarOpen && <span style={{ fontSize: 13 }}>{store.isOpen ? "Loja Aberta" : "Loja Fechada"}</span>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ background: "#fff", padding: "16px 24px", borderBottom: "1px solid #F0F0EE", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>{MENU.find(m => m.id === section)?.icon} {MENU.find(m => m.id === section)?.label}</h2>
          <div style={{ background: store.isOpen ? "#2ECC71" : "#EF4444", color: "#fff", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{store.isOpen ? "● Aberta" : "● Fechada"}</div>
        </div>

        <div style={{ padding: 24 }}>

          {/* ORDERS */}
          {section === "orders" && (
            <div style={{ textAlign: "center", padding: 60, color: "#9B9B9B" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Gestão de Pedidos</p>
              <p style={{ fontSize: 14, maxWidth: 400, margin: "0 auto", lineHeight: 1.7 }}>Os pedidos chegam via WhatsApp no número <strong style={{ color: "#FF4D00" }}>({WHATSAPP_NUMBER.slice(2,4)}) {WHATSAPP_NUMBER.slice(4,9)}-{WHATSAPP_NUMBER.slice(9)}</strong>. Quando um cliente finaliza o pedido, você recebe uma mensagem com todos os detalhes automaticamente.</p>
              <div style={{ marginTop: 24, background: "#F7F7F5", borderRadius: 16, padding: 20, textAlign: "left", maxWidth: 400, margin: "24px auto 0" }}>
                <p style={{ fontWeight: 700, marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>📱 Mensagem que você recebe:</p>
                <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.8 }}>
                  🛵 <strong>NOVO PEDIDO</strong><br/>
                  👤 Nome do cliente<br/>
                  📱 Telefone<br/>
                  📍 Endereço + link Google Maps<br/>
                  🛒 Itens pedidos<br/>
                  💵 Total + forma de pagamento<br/>
                  📦 Entrega ou retirada
                </p>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {section === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <p style={{ color: "#6B7280", fontSize: 14 }}>{products.length} produtos</p>
                <button onClick={() => setShowAddProduct(true)} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>+ Novo Produto</button>
              </div>

              {/* Add Product Form */}
              {showAddProduct && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 16 }}>Novo Produto</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Nome *</label>
                      <input placeholder="Ex: Hambúrguer Especial" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Preço *</label>
                      <input placeholder="Ex: 29.90" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Categoria</label>
                  <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Tag</label>
                  <select value={newProduct.tag || ""} onChange={e => setNewProduct(p => ({ ...p, tag: e.target.value || null }))} style={inputStyle}>
                    <option value="">Sem tag</option>
                    <option value="bestseller">Mais Vendido</option>
                    <option value="new">Novo</option>
                    <option value="promo">Promoção</option>
                  </select>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Descrição</label>
                  <textarea placeholder="Descreva o produto..." value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, height: 70, resize: "none" }} />
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Foto do produto</label>
                  <ImageUpload value={newProduct.image} onChange={img => setNewProduct(p => ({ ...p, image: img }))} style={{ marginBottom: 16 }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={saveProduct} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
                    <button onClick={() => setShowAddProduct(false)} style={{ background: "#F0F0EE", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* Edit Product Modal */}
              {editingProduct && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setEditingProduct(null)}>
                  <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 20, fontSize: 18 }}>Editar Produto</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Nome *</label>
                        <input value={editingProduct.name} onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Preço *</label>
                        <input value={editingProduct.price} onChange={e => setEditingProduct(p => ({ ...p, price: e.target.value }))} style={inputStyle} />
                      </div>
                    </div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Categoria</label>
                    <select value={editingProduct.category} onChange={e => setEditingProduct(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Tag</label>
                    <select value={editingProduct.tag || ""} onChange={e => setEditingProduct(p => ({ ...p, tag: e.target.value || null }))} style={inputStyle}>
                      <option value="">Sem tag</option>
                      <option value="bestseller">Mais Vendido</option>
                      <option value="new">Novo</option>
                      <option value="promo">Promoção</option>
                    </select>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Descrição</label>
                    <textarea value={editingProduct.description} onChange={e => setEditingProduct(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, height: 70, resize: "none" }} />
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Foto do produto</label>
                    <ImageUpload value={editingProduct.image} onChange={img => setEditingProduct(p => ({ ...p, image: img }))} style={{ marginBottom: 16 }} />
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={saveEditProduct} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", flex: 1 }}>Salvar Alterações</button>
                      <button onClick={() => setEditingProduct(null)} style={{ background: "#F0F0EE", border: "none", borderRadius: 10, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {products.map(p => (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", opacity: p.active ? 1 : 0.55 }}>
                    <div style={{ position: "relative", height: 150 }}>
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {p.tag && <div style={{ position: "absolute", top: 8, left: 8 }}><Badge tag={p.tag} /></div>}
                      <div style={{ position: "absolute", top: 8, right: 8, background: p.active ? "#2ECC71" : "#EF4444", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{p.active ? "Ativo" : "Oculto"}</div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{p.name}</h4>
                      <p style={{ fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>R$ {Number(p.price).toFixed(2)}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setEditingProduct({ ...p })} style={{ flex: 1, background: "#EFF6FF", border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#1D4ED8" }}>✏️ Editar</button>
                        <button onClick={() => toggleProduct(p.id)} style={{ flex: 1, background: p.active ? "#FEE2E2" : "#D1FAE5", border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: p.active ? "#991B1B" : "#065F46" }}>{p.active ? "Ocultar" : "Ativar"}</button>
                        <button onClick={() => deleteProduct(p.id)} style={{ background: "#F0F0EE", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STORE SETTINGS */}
          {section === "store" && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 20 }}>🏪 Informações da Loja</h3>
                {[["name", "Nome da Loja"], ["category", "Categoria (ex: Hambúrgueres & Delivery)"], ["deliveryTime", "Tempo de Entrega (ex: 30–50 min)"], ["prepTime", "Tempo de Preparo (ex: 15–25 min)"]].map(([field, label]) => (
                  <div key={field} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
                    <input value={store[field] || ""} onChange={e => updateStore(field, e.target.value)} style={inputStyle} />
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Taxa de Entrega (R$)</label>
                    <input type="number" step="0.01" value={store.deliveryFee} onChange={e => updateStore("deliveryFee", parseFloat(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Pedido Mínimo (R$)</label>
                    <input type="number" step="0.01" value={store.minOrder} onChange={e => updateStore("minOrder", parseFloat(e.target.value))} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 16 }}>🖼️ Banner da Loja</h3>
                <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>Esta é a imagem grande no topo do cardápio.</p>
                <ImageUpload value={store.banner} onChange={img => updateStore("banner", img)} style={{ marginBottom: 14 }} />
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Ou cole um link de imagem</label>
                <input placeholder="https://..." value={store.banner?.startsWith("data:") ? "" : store.banner} onChange={e => updateStore("banner", e.target.value)} style={inputStyle} />
              </div>

              <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 16 }}>🏷️ Logo da Loja</h3>
                <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>Aparece no canto do banner. Pode ser um emoji ou uma imagem.</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Emoji (ex: 🍔 🍕 🌮)</label>
                  <input placeholder="🍔" value={store.logo?.startsWith("data:") || store.logo?.startsWith("http") ? "" : store.logo} onChange={e => updateStore("logo", e.target.value)} style={{ ...inputStyle, fontSize: 24, textAlign: "center" }} />
                </div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Ou faça upload de uma imagem</label>
                <ImageUpload value={store.logo?.startsWith("data:") ? store.logo : null} onChange={img => updateStore("logo", img)} />
              </div>

              <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 16 }}>🔴🟢 Status da Loja</h3>
                <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 16 }}>Quando a loja está fechada, os clientes veem uma mensagem informando que voltará em breve.</p>
                <button onClick={() => { updateStore("isOpen", !store.isOpen); notify(store.isOpen ? "Loja fechada!" : "Loja aberta!"); }} style={{ background: store.isOpen ? "#FEE2E2" : "#D1FAE5", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 800, cursor: "pointer", fontSize: 15, color: store.isOpen ? "#991B1B" : "#065F46", fontFamily: "'Syne', sans-serif" }}>
                  {store.isOpen ? "🔴 Fechar a Loja" : "🟢 Abrir a Loja"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  function tryLogin() {
    if (pwd === ADMIN_PASSWORD) { onLogin(); }
    else { setError(true); setTimeout(() => setError(false), 2000); setPwd(""); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{globalStyles}</style>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ width: 64, height: 64, background: "#FF4D00", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>🔐</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Portal do Admin</h2>
        <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 28 }}>Acesso exclusivo para o dono da loja</p>
        <input
          type="password"
          placeholder="Digite a senha"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tryLogin()}
          style={{ width: "100%", border: `2px solid ${error ? "#EF4444" : "#F0F0EE"}`, borderRadius: 12, padding: "13px 16px", fontSize: 15, outline: "none", marginBottom: 14, textAlign: "center", letterSpacing: 4 }}
        />
        {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 10 }}>Senha incorreta!</p>}
        <button onClick={tryLogin} style={{ width: "100%", background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Entrar →</button>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [store, setStore] = useState(DEFAULT_STORE);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const isAdmin = window.location.pathname === "/admin" || window.location.hash === "#admin";

  if (isAdmin) {
    if (!adminLoggedIn) return <AdminLogin onLogin={() => setAdminLoggedIn(true)} />;
    return <AdminArea products={products} setProducts={setProducts} store={store} setStore={setStore} />;
  }

  return <CustomerArea products={products} store={store} />;
}
