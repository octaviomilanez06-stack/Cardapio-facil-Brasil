import { useState, useEffect, useRef } from "react";

const WHATSAPP_NUMBER = "5521977016114";
const ADMIN_PASSWORD = "admin123";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #F7F7F5; color: #1A1A1A; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F0F0EE; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
`;

const STORE = {
  name: "Cardápio Fácil Brasil",
  category: "Delivery",
  phone: "21977016114",
  deliveryFee: 5.00,
  minOrder: 25.00,
  deliveryTime: "30–50 min",
  prepTime: "15–25 min",
  banner: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80",
  logo: "🍔",
};

const INITIAL_PRODUCTS = [
  { id: 1, name: "Classic Smash Burger", category: "Hambúrgueres", price: 32.9, description: "Dois smash patties 90g, queijo cheddar, pickles, cebola roxa e molho especial.", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80", tag: "bestseller", active: true },
  { id: 2, name: "Double Bacon Crispy", category: "Hambúrgueres", price: 42.9, description: "Dupla blend especial, bacon crocante, queijo coalho, alface, tomate e maionese defumada.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", tag: "new", active: true },
  { id: 3, name: "Veggie Deluxe", category: "Hambúrgueres", price: 29.9, description: "Hambúrguer de grão-de-bico, queijo brie, rúcula, tomate seco e pesto de manjericão.", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80", tag: null, active: true },
  { id: 4, name: "Batata Frita Rústica", category: "Acompanhamentos", price: 18.9, description: "Batatas rústicas temperadas com alecrim e flor de sal, com molho aioli.", image: "https://images.unsplash.com/photo-1529990098630-4022df7bb7cc?w=400&q=80", tag: "promo", active: true },
  { id: 5, name: "Onion Rings Premium", category: "Acompanhamentos", price: 22.9, description: "Anéis de cebola empanados em panko crocante com molho ranch.", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80", tag: null, active: true },
  { id: 6, name: "Milkshake Oreo", category: "Bebidas", price: 24.9, description: "Milkshake cremoso com sorvete de baunilha, biscoito Oreo e chantilly.", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", tag: "bestseller", active: true },
  { id: 7, name: "Coca-Cola 600ml", category: "Bebidas", price: 9.9, description: "Coca-Cola gelada bem geladinha.", image: "https://images.unsplash.com/photo-1629203851122-3726555cf519?w=400&q=80", tag: null, active: true },
  { id: 8, name: "Brownie com Sorvete", category: "Sobremesas", price: 19.9, description: "Brownie quentinho de chocolate belga com sorvete de baunilha e calda de caramelo.", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80", tag: "new", active: true },
  { id: 9, name: "Combo Família", category: "Combos", price: 89.9, description: "2 Classic Smash + 1 Double Bacon + 2 Batatas Grandes + 4 Refris 350ml.", image: "https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400&q=80", tag: "promo", active: true },
];

const TAG_COLORS = { bestseller: "#FF4D00", new: "#2ECC71", promo: "#FFE500" };
const TAG_LABELS = { bestseller: "Mais Vendido", new: "Novo", promo: "Promoção" };
const STATUS_FLOW = ["received", "accepted", "preparing", "delivering", "delivered"];
const STATUS_LABELS = { received: "Recebido", accepted: "Aceito", preparing: "Preparando", delivering: "A caminho", delivered: "Entregue" };
const STATUS_COLORS = { received: "#6B7280", accepted: "#3B82F6", preparing: "#F59E0B", delivering: "#8B5CF6", delivered: "#10B981" };

// ─── SHARED ──────────────────────────────────────────────────────────────────
function Badge({ tag }) {
  if (!tag) return null;
  return <span style={{ background: TAG_COLORS[tag], color: tag === "promo" ? "#1A1A1A" : "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>{TAG_LABELS[tag]}</span>;
}

// ─── CUSTOMER AREA ────────────────────────────────────────────────────────────
function CustomerArea({ products }) {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [step, setStep] = useState("menu"); // menu | checkout | tracking
  const [orderType, setOrderType] = useState("delivery");
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "", payment: "pix", change: "" });
  const [currentOrder, setCurrentOrder] = useState(null);
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
  const total = cartTotal + (orderType === "delivery" ? STORE.deliveryFee : 0);

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

    const items = cart.map(i => `• ${i.qty}x ${i.name} — R$ ${(i.price * i.qty).toFixed(2)}`).join("\n");
    const msg = `🛵 *NOVO PEDIDO*\n\n👤 *Cliente:* ${customerInfo.name}\n📱 *Telefone:* ${customerInfo.phone}\n${orderType === "delivery" ? `📍 *Endereço:* ${customerInfo.address}\n` : "🏪 *Retirada no local*\n"}\n🛒 *Itens:*\n${items}\n\n💰 *Subtotal:* R$ ${cartTotal.toFixed(2)}${orderType === "delivery" ? `\n🛵 *Taxa de entrega:* R$ ${STORE.deliveryFee.toFixed(2)}` : ""}\n💵 *Total:* R$ ${total.toFixed(2)}\n💳 *Pagamento:* ${customerInfo.payment.toUpperCase()}${customerInfo.payment === "dinheiro" && customerInfo.change ? `\n💵 *Troco para:* R$ ${customerInfo.change}` : ""}\n📦 *Tipo:* ${orderType === "delivery" ? "Entrega" : "Retirada"}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");

    const order = { id: Date.now(), customer: customerInfo.name, items: cart, total, type: orderType, payment: customerInfo.payment, address: customerInfo.address, status: "received", time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    setCurrentOrder(order);
    setStep("tracking");
    setOrderStatus(0);
    setCart([]);
    setTimeout(() => setOrderStatus(1), 3000);
  }

  if (step === "tracking") return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{globalStyles}</style>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🛵</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800 }}>Pedido enviado!</h1>
        <p style={{ color: "#6B7280", marginTop: 8 }}>Acompanhe o status do seu pedido</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 4px 30px rgba(0,0,0,0.08)", marginBottom: 24 }}>
        {STATUS_FLOW.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: i < 4 ? 20 : 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i <= orderStatus ? "#FF4D00" : "#F0F0EE", color: i <= orderStatus ? "#fff" : "#aaa", fontWeight: 800, fontSize: 14, flexShrink: 0, transition: "all 0.5s" }}>{i <= orderStatus ? "✓" : i + 1}</div>
            <span style={{ fontWeight: i === orderStatus ? 700 : 400, color: i <= orderStatus ? "#1A1A1A" : "#aaa", transition: "all 0.5s" }}>{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>
      <button onClick={() => { setStep("menu"); setCurrentOrder(null); setOrderStatus(0); }} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 15 }}>Fazer Novo Pedido</button>
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
        {/* Tipo */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>Tipo de pedido</h3>
          <div style={{ display: "flex", gap: 12 }}>
            {["delivery", "retirada"].map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `2px solid ${orderType === t ? "#FF4D00" : "#F0F0EE"}`, background: orderType === t ? "#FFF5F0" : "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 14 }}>
                {t === "delivery" ? "🛵 Entrega" : "🏪 Retirada"}
              </button>
            ))}
          </div>
        </div>

        {/* Dados */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>Seus dados</h3>
          {[["name", "Seu nome *", "text"], ["phone", "Seu WhatsApp *", "tel"], ...(orderType === "delivery" ? [["address", "Endereço completo *", "text"]] : [])].map(([field, label, type]) => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
              <input type={type} value={customerInfo[field] || ""} onChange={e => setCustomerInfo(p => ({ ...p, [field]: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", fontFamily: "'Inter', sans-serif", outline: "none", fontSize: 14 }} />
            </div>
          ))}
        </div>

        {/* Pagamento */}
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
              <input type="number" placeholder="Ex: 100" value={customerInfo.change} onChange={e => setCustomerInfo(p => ({ ...p, change: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", fontFamily: "'Inter', sans-serif", outline: "none" }} />
            </div>
          )}
        </div>

        {/* Resumo */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>Resumo</h3>
          {cart.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>{i.qty}x {i.name}</span>
              <span style={{ fontWeight: 600 }}>R$ {(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #F0F0EE", marginTop: 12, paddingTop: 12 }}>
            {orderType === "delivery" && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6, color: "#6B7280" }}><span>Taxa de entrega</span><span>R$ {STORE.deliveryFee.toFixed(2)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 16 }}><span>Total</span><span style={{ color: "#FF4D00" }}>R$ {total.toFixed(2)}</span></div>
          </div>
        </div>

        <button onClick={sendWhatsApp} style={{ width: "100%", background: "#25D366", color: "#fff", border: "none", borderRadius: 14, padding: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          📱 Enviar pedido pelo WhatsApp
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5" }}>
      <style>{globalStyles}</style>

      {/* Banner */}
      <div style={{ position: "relative", height: 240 }}>
        <img src={STORE.banner} alt="banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.75))" }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ width: 56, height: 56, background: "#fff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>{STORE.logo}</div>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>{STORE.name}</h1>
              <p style={{ fontSize: 13, opacity: 0.85 }}>{STORE.category}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 12, flexWrap: "wrap" }}>
            <span>🕐 {STORE.deliveryTime}</span>
            <span>📦 Mín. R$ {STORE.minOrder.toFixed(2)}</span>
            <span>🛵 R$ {STORE.deliveryFee.toFixed(2)}</span>
            <span style={{ background: "#2ECC71", color: "#fff", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>● Aberto</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: "#fff", padding: "14px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 12, padding: "11px 14px 11px 42px", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }} onFocus={e => e.target.style.borderColor = "#FF4D00"} onBlur={e => e.target.style.borderColor = "#F0F0EE"} />
        </div>
      </div>

      {/* Categories */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0F0EE", overflowX: "auto", whiteSpace: "nowrap", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "inline-flex", gap: 4, padding: "10px 0" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 16px", borderRadius: 24, border: "none", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, background: activeCategory === cat ? "#FF4D00" : "#F0F0EE", color: activeCategory === cat ? "#fff" : "#1A1A1A", transition: "all 0.2s", whiteSpace: "nowrap" }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Products */}
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

      {/* Cart button */}
      {cartCount > 0 && (
        <button onClick={() => setShowCart(true)} style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#FF4D00", color: "#fff", border: "none", borderRadius: 14, padding: "15px 28px", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 8px 28px rgba(255,77,0,0.4)", display: "flex", alignItems: "center", gap: 12, zIndex: 200, whiteSpace: "nowrap" }}>
          <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "2px 10px", fontSize: 13 }}>{cartCount}</span>
          Ver Carrinho
          <span>R$ {cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* Product Modal */}
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

      {/* Cart Modal */}
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
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}><span style={{ color: "#6B7280" }}>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 15 }}><span>Total (sem entrega)</span><span style={{ color: "#FF4D00" }}>R$ {cartTotal.toFixed(2)}</span></div>
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
function AdminArea({ products, setProducts, orders, setOrders }) {
  const [section, setSection] = useState("orders");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Hambúrgueres", description: "", image: "", tag: "" });
  const [notif, setNotif] = useState(null);

  function notify(msg, type = "success") {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  }

  function advanceOrder(id) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const idx = STATUS_FLOW.indexOf(o.status);
      const next = STATUS_FLOW[idx + 1] || o.status;
      return { ...o, status: next };
    }));
    notify("Status atualizado!");
  }

  function toggleProduct(id) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    notify("Produto atualizado!");
  }

  function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id));
    notify("Produto removido!");
  }

  function addProduct() {
    if (!newProduct.name || !newProduct.price) return notify("Preencha nome e preço!", "error");
    setProducts(prev => [...prev, { id: Date.now(), ...newProduct, price: parseFloat(newProduct.price), active: true, image: newProduct.image || "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80" }]);
    setShowAddProduct(false);
    setNewProduct({ name: "", price: "", category: "Hambúrgueres", description: "", image: "", tag: "" });
    notify("Produto adicionado!");
  }

  const MENU = [
    { id: "orders", icon: "📋", label: "Pedidos" },
    { id: "products", icon: "🍔", label: "Produtos" },
    { id: "dashboard", icon: "📊", label: "Dashboard" },
  ];

  const pendingOrders = orders.filter(o => o.status !== "delivered");

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F7F7F5", overflow: "hidden" }}>
      <style>{globalStyles}</style>

      {notif && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: notif.type === "success" ? "#2ECC71" : "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>{notif.msg}</div>}

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 220 : 60, background: "#1A1A1A", color: "#fff", display: "flex", flexDirection: "column", transition: "width 0.3s", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "18px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "#FF4D00", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🍔</div>
          {sidebarOpen && <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>{sidebarOpen ? "◁" : "▷"}</button>
        </div>
        <nav style={{ flex: 1, padding: "10px 6px" }}>
          {MENU.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: section === item.id ? "#FF4D00" : "transparent", color: section === item.id ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: section === item.id ? 700 : 400, marginBottom: 3, transition: "all 0.2s", textAlign: "left", fontFamily: "'Inter', sans-serif" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>{item.label}</span>}
              {item.id === "orders" && pendingOrders.length > 0 && sidebarOpen && <span style={{ marginLeft: "auto", background: "#FF4D00", color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 800 }}>{pendingOrders.length}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ background: "#fff", padding: "16px 24px", borderBottom: "1px solid #F0F0EE", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>{MENU.find(m => m.id === section)?.icon} {MENU.find(m => m.id === section)?.label}</h2>
          <div style={{ background: "#2ECC71", color: "#fff", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>● Loja Aberta</div>
        </div>

        <div style={{ padding: 24 }}>

          {/* ORDERS */}
          {section === "orders" && (
            <div>
              {/* Status summary */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <div key={key} style={{ background: STATUS_COLORS[key] + "20", color: STATUS_COLORS[key], padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {label}: {orders.filter(o => o.status === key).length}
                  </div>
                ))}
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#9B9B9B" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>Nenhum pedido ainda</p>
                  <p style={{ fontSize: 14, marginTop: 8 }}>Os pedidos aparecerão aqui quando clientes finalizarem pelo cardápio.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${STATUS_COLORS[order.status]}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15 }}>#{order.id}</span>
                            <span style={{ background: STATUS_COLORS[order.status] + "20", color: STATUS_COLORS[order.status], padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{STATUS_LABELS[order.status]}</span>
                            <span style={{ fontSize: 12, color: "#9B9B9B" }}>🕐 {order.time}</span>
                          </div>
                          <p style={{ fontWeight: 600, marginBottom: 4 }}>👤 {order.customer}</p>
                          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>{order.items?.map(i => `${i.qty}x ${i.name}`).join(", ")}</p>
                          <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#9B9B9B", flexWrap: "wrap" }}>
                            <span>💳 {order.payment?.toUpperCase()}</span>
                            <span>{order.type === "delivery" ? `🛵 Entrega • ${order.address}` : "🏪 Retirada"}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#FF4D00", marginBottom: 8 }}>R$ {order.total?.toFixed(2)}</p>
                          {order.status !== "delivered" && (
                            <button onClick={() => advanceOrder(order.id)} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Avançar Status →</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS */}
          {section === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <p style={{ color: "#6B7280", fontSize: 14 }}>{products.length} produtos</p>
                <button onClick={() => setShowAddProduct(true)} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>+ Novo Produto</button>
              </div>

              {showAddProduct && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 16 }}>Novo Produto</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <input placeholder="Nome *" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} style={{ border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", fontFamily: "'Inter', sans-serif", outline: "none" }} />
                    <input placeholder="Preço (ex: 29.90) *" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={{ border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", fontFamily: "'Inter', sans-serif", outline: "none" }} />
                  </div>
                  <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontFamily: "'Inter', sans-serif", outline: "none" }}>
                    {["Hambúrgueres", "Acompanhamentos", "Bebidas", "Sobremesas", "Combos"].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <textarea placeholder="Descrição" value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", height: 70, resize: "none", fontFamily: "'Inter', sans-serif", outline: "none", marginBottom: 12 }} />
                  <input placeholder="URL da imagem (opcional)" value={newProduct.image} onChange={e => setNewProduct(p => ({ ...p, image: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", fontFamily: "'Inter', sans-serif", outline: "none", marginBottom: 12 }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={addProduct} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
                    <button onClick={() => setShowAddProduct(false)} style={{ background: "#F0F0EE", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {products.map(p => (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", opacity: p.active ? 1 : 0.5 }}>
                    <div style={{ position: "relative", height: 150 }}>
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {p.tag && <div style={{ position: "absolute", top: 8, left: 8 }}><Badge tag={p.tag} /></div>}
                      <div style={{ position: "absolute", top: 8, right: 8, background: p.active ? "#2ECC71" : "#EF4444", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{p.active ? "Ativo" : "Oculto"}</div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{p.name}</h4>
                      <p style={{ fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>R$ {p.price.toFixed(2)}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleProduct(p.id)} style={{ flex: 1, background: p.active ? "#FEE2E2" : "#D1FAE5", border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: p.active ? "#991B1B" : "#065F46" }}>{p.active ? "Ocultar" : "Ativar"}</button>
                        <button onClick={() => deleteProduct(p.id)} style={{ background: "#F0F0EE", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {section === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Total de Pedidos", value: orders.length, icon: "📦", color: "#FF4D00" },
                  { label: "Pedidos Ativos", value: pendingOrders.length, icon: "🔥", color: "#F59E0B" },
                  { label: "Faturamento", value: `R$ ${orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2)}`, icon: "💰", color: "#2ECC71" },
                  { label: "Produtos Ativos", value: products.filter(p => p.active).length, icon: "🍔", color: "#3B82F6" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
                    <p style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16 }}>Últimos Pedidos</h3>
                {orders.slice(-5).reverse().map(o => (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F7F7F5" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{o.customer}</p>
                      <p style={{ fontSize: 12, color: "#9B9B9B" }}>{o.time} • {STATUS_LABELS[o.status]}</p>
                    </div>
                    <span style={{ fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>R$ {o.total?.toFixed(2)}</span>
                  </div>
                ))}
                {orders.length === 0 && <p style={{ color: "#9B9B9B", fontSize: 14 }}>Nenhum pedido ainda.</p>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  function tryLogin() {
    if (pwd === ADMIN_PASSWORD) { onLogin(); }
    else { setError(true); setTimeout(() => setError(false), 2000); }
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
          style={{ width: "100%", border: `2px solid ${error ? "#EF4444" : "#F0F0EE"}`, borderRadius: 12, padding: "13px 16px", fontFamily: "'Inter', sans-serif", fontSize: 15, outline: "none", marginBottom: 14, textAlign: "center", letterSpacing: 4 }}
        />
        {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 10 }}>Senha incorreta!</p>}
        <button onClick={tryLogin} style={{ width: "100%", background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Entrar →</button>
        <p style={{ marginTop: 20, fontSize: 12, color: "#9B9B9B" }}>Senha padrão: admin123</p>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const isAdmin = window.location.pathname === "/admin" || window.location.hash === "#admin";

  if (isAdmin) {
    if (!adminLoggedIn) return <AdminLogin onLogin={() => setAdminLoggedIn(true)} />;
    return <AdminArea products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} />;
  }

  return <CustomerArea products={products} />;
}
