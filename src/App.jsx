import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// MOCK DATA
// ============================================================
const STORE = {
  name: "Burger House",
  category: "Hambúrgueres & Lanches",
  rating: 4.8,
  reviews: 1243,
  deliveryTime: "25–40 min",
  minOrder: "R$ 25,00",
  deliveryFee: "R$ 5,00",
  status: "open",
  openUntil: "23:00",
  phone: "(11) 99999-0000",
  address: "Rua das Flores, 123 – São Paulo, SP",
  instagram: "@burgerhouse",
  banner: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80",
  logo: "🍔",
};

const CATEGORIES = [
  { id: "all", name: "Todos", icon: "🍽️" },
  { id: "burgers", name: "Hambúrgueres", icon: "🍔" },
  { id: "sides", name: "Acompanhamentos", icon: "🍟" },
  { id: "drinks", name: "Bebidas", icon: "🥤" },
  { id: "desserts", name: "Sobremesas", icon: "🍦" },
  { id: "combos", name: "Combos", icon: "🎁" },
];

const PRODUCTS = [
  { id: 1, name: "Classic Smash Burger", category: "burgers", price: 32.9, promoPrice: 28.9, description: "Dois smash patties de 90g, queijo cheddar, pickles, cebola roxa e nosso molho especial da casa.", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80", tag: "bestseller", prepTime: "12 min", stock: 50, rating: 4.9 },
  { id: 2, name: "Double Bacon Crispy", category: "burgers", price: 42.9, promoPrice: null, description: "Dupla de blend especial, bacon crocante, queijo coalho, alface, tomate e maionese defumada.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", tag: "new", prepTime: "15 min", stock: 30, rating: 4.7 },
  { id: 3, name: "Veggie Deluxe", category: "burgers", price: 29.9, promoPrice: null, description: "Hambúrguer de grão-de-bico, queijo brie, rúcula, tomate seco e pesto de manjericão.", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80", tag: null, prepTime: "10 min", stock: 20, rating: 4.5 },
  { id: 4, name: "Batata Frita Rústica", category: "sides", price: 18.9, promoPrice: 14.9, description: "Batatas rústicas temperadas com alecrim e flor de sal, servidas com molho aioli.", image: "https://images.unsplash.com/photo-1529990098630-4022df7bb7cc?w=400&q=80", tag: "promo", prepTime: "8 min", stock: 100, rating: 4.6 },
  { id: 5, name: "Onion Rings Premium", category: "sides", price: 22.9, promoPrice: null, description: "Anéis de cebola empanados em panko crocante com molho ranch.", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80", tag: null, prepTime: "10 min", stock: 40, rating: 4.4 },
  { id: 6, name: "Milkshake Oreo", category: "drinks", price: 24.9, promoPrice: null, description: "Milkshake cremoso com sorvete de baunilha, biscoito Oreo e chantilly.", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", tag: "bestseller", prepTime: "5 min", stock: 60, rating: 4.8 },
  { id: 7, name: "Coca-Cola 600ml", category: "drinks", price: 9.9, promoPrice: null, description: "Coca-Cola gelada bem geladinha.", image: "https://images.unsplash.com/photo-1629203851122-3726555cf519?w=400&q=80", tag: null, prepTime: "1 min", stock: 200, rating: 4.5 },
  { id: 8, name: "Brownie com Sorvete", category: "desserts", price: 19.9, promoPrice: null, description: "Brownie quentinho de chocolate belga com bola de sorvete de baunilha e calda de caramelo.", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80", tag: "new", prepTime: "8 min", stock: 25, rating: 4.9 },
  { id: 9, name: "Combo Família", category: "combos", price: 89.9, promoPrice: 74.9, description: "2 Classic Smash + 1 Double Bacon + 2 Batatas Grandes + 4 Refris 350ml.", image: "https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400&q=80", tag: "promo", prepTime: "20 min", stock: 15, rating: 4.8 },
];

const ORDERS_DATA = [
  { id: "#1042", customer: "Lucas Mendes", items: ["Classic Smash Burger x2", "Batata Frita x1"], total: 80.7, status: "preparing", time: "14:32", payment: "PIX" },
  { id: "#1041", customer: "Ana Paula", items: ["Double Bacon Crispy x1", "Milkshake Oreo x1"], total: 67.8, status: "delivering", time: "14:18", payment: "Cartão" },
  { id: "#1040", customer: "Pedro Lima", items: ["Combo Família x1"], total: 74.9, status: "delivered", time: "13:55", payment: "PIX" },
  { id: "#1039", customer: "Mariana Costa", items: ["Veggie Deluxe x1", "Coca-Cola x2"], total: 49.7, status: "received", time: "14:41", payment: "Dinheiro" },
  { id: "#1038", customer: "Felipe Santos", items: ["Classic Smash x1", "Onion Rings x1"], total: 61.8, status: "accepted", time: "14:38", payment: "Cartão" },
];

const TAG_LABELS = { bestseller: "Mais Vendido", new: "Novo", promo: "Promoção", limited: "Limitado" };
const TAG_COLORS = { bestseller: "#FF4D00", new: "#2ECC71", promo: "#FFE500", limited: "#9B59B6" };

const STATUS_LABELS = { received: "Recebido", accepted: "Aceito", preparing: "Preparando", delivering: "A caminho", delivered: "Entregue" };
const STATUS_COLORS = { received: "#6B7280", accepted: "#3B82F6", preparing: "#F59E0B", delivering: "#8B5CF6", delivered: "#10B981" };

// ============================================================
// STYLES
// ============================================================
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #F7F7F5; color: #1A1A1A; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #F0F0EE; }
  ::-webkit-scrollbar-thumb { background: #D0D0CC; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #B0B0AC; }
`;

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Badge({ tag }) {
  if (!tag) return null;
  return (
    <span style={{
      background: TAG_COLORS[tag] || "#999",
      color: tag === "promo" ? "#1A1A1A" : "#fff",
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      padding: "2px 7px", borderRadius: 20, textTransform: "uppercase",
      fontFamily: "'Syne', sans-serif",
    }}>{TAG_LABELS[tag]}</span>
  );
}

function StarRating({ rating }) {
  return (
    <span style={{ color: "#FFB800", fontSize: 13, fontWeight: 600 }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))} {rating}
    </span>
  );
}

// ============================================================
// CUSTOMER AREA
// ============================================================
function CustomerArea({ onSwitchToAdmin }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderStatus, setOrderStatus] = useState(0);
  const categoryRefs = useRef({});

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const cartTotal = cart.reduce((sum, i) => sum + (i.promoPrice || i.price) * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  function addToCart(product) {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function placeOrder() {
    setShowCart(false);
    setOrderPlaced(true);
    setOrderStatus(0);
    const steps = [0, 1, 2, 3, 4];
    steps.forEach((s, i) => setTimeout(() => setOrderStatus(s), i * 2000));
  }

  const statusSteps = ["Pedido Recebido", "Aceito pelo restaurante", "Preparando seu pedido", "Saiu para entrega", "Entregue! 🎉"];

  if (orderPlaced) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <style>{globalStyles}</style>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🛵</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#1A1A1A" }}>Pedido em andamento!</h1>
          <p style={{ color: "#6B7280", marginTop: 8 }}>Acompanhe o status abaixo</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 4px 30px rgba(0,0,0,0.08)" }}>
          {statusSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: i < statusSteps.length - 1 ? 20 : 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: i <= orderStatus ? "#FF4D00" : "#F0F0EE",
                color: i <= orderStatus ? "#fff" : "#aaa", fontSize: 16, fontWeight: 700, flexShrink: 0,
                transition: "all 0.5s ease"
              }}>{i <= orderStatus ? "✓" : i + 1}</div>
              <span style={{ fontWeight: i === orderStatus ? 700 : 400, color: i <= orderStatus ? "#1A1A1A" : "#aaa", transition: "all 0.5s" }}>{step}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setOrderPlaced(false); setCart([]); }} style={{ marginTop: 24, background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
          Novo Pedido
        </button>
        <button onClick={onSwitchToAdmin} style={{ marginTop: 12, background: "transparent", color: "#FF4D00", border: "2px solid #FF4D00", borderRadius: 12, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
          Ir para Painel Admin →
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5" }}>
      <style>{globalStyles}</style>

      {/* Admin switch button */}
      <button onClick={onSwitchToAdmin} style={{
        position: "fixed", top: 16, right: 16, zIndex: 1000,
        background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 20,
        padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
        fontFamily: "'Syne', sans-serif", letterSpacing: 0.5
      }}>⚙️ Admin</button>

      {/* BANNER HEADER */}
      <div style={{ position: "relative", height: 260 }}>
        <img src={STORE.banner} alt="banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))" }} />
        <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ width: 60, height: 60, background: "#fff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{STORE.logo}</div>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800 }}>{STORE.name}</h1>
              <p style={{ fontSize: 13, opacity: 0.85 }}>{STORE.category}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
            <span>⭐ {STORE.rating} ({STORE.reviews} avaliações)</span>
            <span>🕐 {STORE.deliveryTime}</span>
            <span>📦 Mín. {STORE.minOrder}</span>
            <span>🛵 {STORE.deliveryFee}</span>
            <span style={{ background: "#2ECC71", color: "#fff", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>● Aberto</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ background: "#fff", padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produto, categoria, ingrediente..."
            style={{
              width: "100%", border: "2px solid #F0F0EE", borderRadius: 12, padding: "12px 16px 12px 44px",
              fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#FF4D00"}
            onBlur={e => e.target.style.borderColor = "#F0F0EE"}
          />
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0F0EE", overflowX: "auto", whiteSpace: "nowrap", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "inline-flex", gap: 4, padding: "12px 0" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              padding: "8px 18px", borderRadius: 24, border: "none", cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13,
              background: activeCategory === cat.id ? "#FF4D00" : "#F0F0EE",
              color: activeCategory === cat.id ? "#fff" : "#1A1A1A",
              transition: "all 0.2s"
            }}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map(product => (
            <div key={product.id} onClick={() => setSelectedProduct(product)} style={{
              background: "#fff", borderRadius: 20, overflow: "hidden", cursor: "pointer",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)"; }}
            >
              <div style={{ position: "relative", height: 200 }}>
                <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {product.tag && (
                  <div style={{ position: "absolute", top: 12, left: 12 }}><Badge tag={product.tag} /></div>
                )}
                {product.promoPrice && (
                  <div style={{ position: "absolute", top: 12, right: 12, background: "#FF4D00", color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                    -{Math.round((1 - product.promoPrice / product.price) * 100)}%
                  </div>
                )}
              </div>
              <div style={{ padding: "16px" }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#1A1A1A" }}>{product.name}</h3>
                <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    {product.promoPrice ? (
                      <>
                        <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through", marginRight: 6 }}>R$ {product.price.toFixed(2)}</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>R$ {product.promoPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#1A1A1A", fontFamily: "'Syne', sans-serif" }}>R$ {product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); addToCart(product); }} style={{
                    background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12,
                    padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 18,
                    transition: "transform 0.1s"
                  }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>+</button>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12, color: "#9B9B9B" }}>
                  <span>⏱ {product.prepTime}</span>
                  <StarRating rating={product.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#9B9B9B" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>Nenhum produto encontrado</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Tente outra busca ou categoria.</p>
          </div>
        )}
      </div>

      {/* CART BUTTON */}
      {cartCount > 0 && (
        <button onClick={() => setShowCart(true)} style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#FF4D00", color: "#fff", border: "none", borderRadius: 16,
          padding: "16px 32px", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16,
          cursor: "pointer", boxShadow: "0 8px 32px rgba(255,77,0,0.4)",
          display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap",
          zIndex: 200
        }}>
          <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 13 }}>{cartCount}</span>
          Ver Carrinho
          <span style={{ fontWeight: 800 }}>R$ {cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }} onClick={() => setSelectedProduct(null)}>
          <div style={{
            background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 600,
            maxHeight: "90vh", overflow: "auto"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "relative", height: 280 }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setSelectedProduct(null)} style={{
                position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", color: "#fff",
                border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18
              }}>✕</button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>{selectedProduct.name}</h2>
                <Badge tag={selectedProduct.tag} />
              </div>
              <p style={{ color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>{selectedProduct.description}</p>
              <div style={{ background: "#F7F7F5", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 12 }}>Complementos</h4>
                {["Ponto da carne", "Molho extra", "Acompanhamento"].map(group => (
                  <div key={group} style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{group} <span style={{ background: "#FF4D00", color: "#fff", fontSize: 10, padding: "1px 6px", borderRadius: 10 }}>Obrigatório</span></p>
                    {["Opção 1", "Opção 2", "Opção 3"].map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer", fontSize: 14 }}>
                        <input type="radio" name={group} style={{ accentColor: "#FF4D00" }} /> {opt}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              <textarea placeholder="Alguma observação? (opcional)" style={{
                width: "100%", border: "2px solid #F0F0EE", borderRadius: 12, padding: 12,
                fontFamily: "'Inter', sans-serif", fontSize: 14, resize: "none", height: 80, outline: "none"
              }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                <div>
                  {selectedProduct.promoPrice ? (
                    <>
                      <span style={{ fontSize: 13, color: "#aaa", textDecoration: "line-through", display: "block" }}>R$ {selectedProduct.price.toFixed(2)}</span>
                      <span style={{ fontSize: 24, fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>R$ {selectedProduct.promoPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>R$ {selectedProduct.price.toFixed(2)}</span>
                  )}
                </div>
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} style={{
                  background: "#FF4D00", color: "#fff", border: "none", borderRadius: 14,
                  padding: "14px 28px", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer"
                }}>
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCart && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowCart(false)}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid #F0F0EE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20 }}>Seu Carrinho</h2>
              <button onClick={() => setShowCart(false)} style={{ background: "#F0F0EE", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ padding: "16px 24px" }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #F7F7F5" }}>
                  <img src={item.image} alt={item.name} style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{item.name}</p>
                    <p style={{ fontSize: 13, color: "#6B7280" }}>R$ {(item.promoPrice || item.price).toFixed(2)}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <button onClick={() => { if (item.qty <= 1) removeFromCart(item.id); else setCart(p => p.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i)); }} style={{ background: "#F0F0EE", border: "none", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontWeight: 700 }}>−</button>
                      <span style={{ fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => setCart(p => p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))} style={{ background: "#FF4D00", color: "#fff", border: "none", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontWeight: 700 }}>+</button>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#FF4D00" }}>R$ {((item.promoPrice || item.price) * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ background: "#F7F7F5", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#6B7280" }}>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#6B7280" }}>Taxa de entrega</span><span>R$ 5,00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 16 }}>
                  <span>Total</span><span style={{ color: "#FF4D00" }}>R$ {(cartTotal + 5).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={placeOrder} style={{
                width: "100%", background: "#FF4D00", color: "#fff", border: "none", borderRadius: 16,
                padding: "18px", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer"
              }}>Finalizar Pedido →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN AREA
// ============================================================
function AdminArea({ onSwitchToCustomer }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [orders, setOrders] = useState(ORDERS_DATA);
  const [products, setProducts] = useState(PRODUCTS);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "burgers", description: "" });
  const [notification, setNotification] = useState(null);

  function showNotif(msg, type = "success") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  function advanceOrder(id) {
    const progression = { received: "accepted", accepted: "preparing", preparing: "delivering", delivering: "delivered" };
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: progression[o.status] || o.status } : o));
    showNotif("Status do pedido atualizado!");
  }

  async function askAI() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: "Você é um assistente especialista em gestão de delivery e food service no Brasil. Responda de forma prática, direta e útil para proprietários de restaurantes/lanchonetes. Use emojis relevantes para deixar mais visual. Responda sempre em português.",
          messages: [{ role: "user", content: aiQuery }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Não foi possível obter resposta.";
      setAiResponse(text);
    } catch (e) {
      setAiResponse("Erro ao conectar com a IA. Verifique a conexão.");
    }
    setAiLoading(false);
  }

  const MENU = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "orders", icon: "📋", label: "Pedidos" },
    { id: "products", icon: "🍔", label: "Produtos" },
    { id: "customers", icon: "👥", label: "Clientes" },
    { id: "financial", icon: "💰", label: "Financeiro" },
    { id: "marketing", icon: "📣", label: "Marketing" },
    { id: "settings", icon: "⚙️", label: "Configurações" },
    { id: "ai", icon: "🤖", label: "IA Assistant" },
  ];

  const STATS = [
    { label: "Pedidos Hoje", value: "47", icon: "📦", color: "#FF4D00", trend: "+12%" },
    { label: "Faturamento Hoje", value: "R$ 2.847", icon: "💰", color: "#2ECC71", trend: "+8%" },
    { label: "Ticket Médio", value: "R$ 60,57", icon: "🎯", color: "#3B82F6", trend: "+3%" },
    { label: "Clientes Novos", value: "18", icon: "👤", color: "#8B5CF6", trend: "+22%" },
  ];

  const CHART_DATA = [12, 19, 8, 24, 31, 22, 47];
  const CHART_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const maxVal = Math.max(...CHART_DATA);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F7F7F5", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      <style>{globalStyles}</style>

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: notification.type === "success" ? "#2ECC71" : "#EF4444",
          color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "none"
        }}>{notification.msg}</div>
      )}

      {/* SIDEBAR */}
      <div style={{
        width: sidebarOpen ? 240 : 64, background: "#1A1A1A", color: "#fff",
        display: "flex", flexDirection: "column", transition: "width 0.3s ease", overflow: "hidden", flexShrink: 0
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "#FF4D00", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🍔</div>
          {sidebarOpen && <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, whiteSpace: "nowrap" }}>Burger House</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>
            {sidebarOpen ? "◁" : "▷"}
          </button>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              padding: "12px 12px", borderRadius: 12, border: "none", cursor: "pointer",
              background: activeSection === item.id ? "#FF4D00" : "transparent",
              color: activeSection === item.id ? "#fff" : "rgba(255,255,255,0.6)",
              fontWeight: activeSection === item.id ? 700 : 400,
              marginBottom: 4, transition: "all 0.2s", textAlign: "left",
              fontFamily: "'Inter', sans-serif",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap", fontSize: 14 }}>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={onSwitchToCustomer} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontFamily: "'Inter', sans-serif"
          }}>
            <span style={{ fontSize: 18 }}>🛍️</span>
            {sidebarOpen && <span style={{ fontSize: 13 }}>Ver como Cliente</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Top Bar */}
        <div style={{ background: "#fff", padding: "16px 28px", borderBottom: "1px solid #F0F0EE", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#1A1A1A" }}>
              {MENU.find(m => m.id === activeSection)?.icon} {MENU.find(m => m.id === activeSection)?.label}
            </h2>
            <p style={{ fontSize: 12, color: "#9B9B9B", marginTop: 2 }}>Domingo, 2 de agosto de 2026</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ background: "#2ECC71", color: "#fff", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>● Loja Aberta</div>
            <div style={{ width: 40, height: 40, background: "#FF4D00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>A</div>
          </div>
        </div>

        <div style={{ padding: "28px" }}>

          {/* DASHBOARD */}
          {activeSection === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                {STATS.map((stat, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${stat.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontSize: 12, color: "#9B9B9B", fontWeight: 500, marginBottom: 8 }}>{stat.label}</p>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#1A1A1A" }}>{stat.value}</p>
                      </div>
                      <span style={{ fontSize: 28 }}>{stat.icon}</span>
                    </div>
                    <p style={{ marginTop: 12, fontSize: 12, color: "#2ECC71", fontWeight: 700 }}>↑ {stat.trend} vs. ontem</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                {/* Chart */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Pedidos da Semana</h3>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
                    {CHART_DATA.map((val, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#FF4D00" }}>{val}</span>
                        <div style={{
                          width: "100%", background: i === 6 ? "#FF4D00" : "#FFE5D9",
                          borderRadius: "6px 6px 0 0", height: `${(val / maxVal) * 120}px`,
                          transition: "height 0.5s ease"
                        }} />
                        <span style={{ fontSize: 11, color: "#9B9B9B" }}>{CHART_DAYS[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top products */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16 }}>Mais Vendidos</h3>
                  {PRODUCTS.slice(0, 4).map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#FF4D00", width: 20 }}>{i + 1}°</span>
                      <img src={p.image} alt={p.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: "#9B9B9B" }}>{Math.floor(Math.random() * 50 + 10)} vendas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeSection === "orders" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <div key={key} style={{ background: STATUS_COLORS[key] + "20", color: STATUS_COLORS[key], padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {label}: {orders.filter(o => o.status === key).length}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {orders.map(order => (
                  <div key={order.id} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${STATUS_COLORS[order.status]}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>{order.id}</span>
                          <span style={{ background: STATUS_COLORS[order.status] + "20", color: STATUS_COLORS[order.status], padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{STATUS_LABELS[order.status]}</span>
                        </div>
                        <p style={{ fontWeight: 600, marginBottom: 4 }}>👤 {order.customer}</p>
                        <p style={{ fontSize: 13, color: "#6B7280" }}>{order.items.join(", ")}</p>
                        <p style={{ fontSize: 12, color: "#9B9B9B", marginTop: 4 }}>💳 {order.payment} • 🕐 {order.time}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#FF4D00" }}>R$ {order.total.toFixed(2)}</p>
                        {order.status !== "delivered" && (
                          <button onClick={() => advanceOrder(order.id)} style={{
                            marginTop: 8, background: "#FF4D00", color: "#fff", border: "none",
                            borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12
                          }}>Avançar Status →</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {activeSection === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <p style={{ color: "#6B7280", fontSize: 14 }}>{products.length} produtos cadastrados</p>
                <button onClick={() => setShowAddProduct(true)} style={{
                  background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12,
                  padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif"
                }}>+ Novo Produto</button>
              </div>
              {showAddProduct && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: 16 }}>Novo Produto</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <input placeholder="Nome do produto" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} style={{ border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", fontFamily: "'Inter', sans-serif", outline: "none" }} />
                    <input placeholder="Preço (ex: 29.90)" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={{ border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", fontFamily: "'Inter', sans-serif", outline: "none" }} />
                  </div>
                  <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontFamily: "'Inter', sans-serif", outline: "none" }}>
                    {CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                  <textarea placeholder="Descrição do produto..." value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", height: 80, resize: "none", fontFamily: "'Inter', sans-serif", outline: "none", marginBottom: 12 }} />
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => {
                      if (!newProduct.name || !newProduct.price) return showNotif("Preencha nome e preço!", "error");
                      setProducts(prev => [...prev, { id: Date.now(), ...newProduct, price: parseFloat(newProduct.price), image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80", tag: "new", prepTime: "15 min", stock: 50, rating: 4.5, promoPrice: null }]);
                      setShowAddProduct(false);
                      setNewProduct({ name: "", price: "", category: "burgers", description: "" });
                      showNotif("Produto adicionado com sucesso!");
                    }} style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
                    <button onClick={() => setShowAddProduct(false)} style={{ background: "#F0F0EE", color: "#1A1A1A", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {products.map(p => (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ position: "relative", height: 160 }}>
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {p.tag && <div style={{ position: "absolute", top: 10, left: 10 }}><Badge tag={p.tag} /></div>}
                    </div>
                    <div style={{ padding: 16 }}>
                      <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 4 }}>{p.name}</h4>
                      <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, color: "#FF4D00", fontFamily: "'Syne', sans-serif" }}>R$ {p.price.toFixed(2)}</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={{ background: "#F0F0EE", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>✏️ Editar</button>
                          <button onClick={() => { setProducts(prev => prev.filter(x => x.id !== p.id)); showNotif("Produto removido!"); }} style={{ background: "#FEE2E2", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {activeSection === "customers" && (
            <div>
              <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0EE", display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Clientes Cadastrados</h3>
                  <button style={{ background: "#F0F0EE", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📤 Exportar</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F7F7F5" }}>
                        {["Cliente", "Telefone", "Pedidos", "Total Gasto", "Última Compra", "Status"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6B7280", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Lucas Mendes", phone: "(11) 9 9999-1111", orders: 14, total: 847.3, last: "Hoje", vip: true },
                        { name: "Ana Paula Silva", phone: "(11) 9 8888-2222", orders: 8, total: 512.6, last: "Ontem", vip: false },
                        { name: "Pedro Lima", phone: "(11) 9 7777-3333", orders: 22, total: 1243.9, last: "Hoje", vip: true },
                        { name: "Mariana Costa", phone: "(11) 9 6666-4444", orders: 5, total: 287.4, last: "3 dias", vip: false },
                        { name: "Felipe Santos", phone: "(11) 9 5555-5555", orders: 11, total: 634.8, last: "2 dias", vip: false },
                      ].map((c, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #F7F7F5" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FF4D00", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{c.name[0]}</div>
                              <span style={{ fontWeight: 600 }}>{c.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 14, color: "#6B7280" }}>{c.phone}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700 }}>{c.orders}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#FF4D00" }}>R$ {c.total.toFixed(2)}</td>
                          <td style={{ padding: "14px 16px", fontSize: 14, color: "#6B7280" }}>{c.last}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ background: c.vip ? "#FFE500" : "#F0F0EE", color: c.vip ? "#1A1A1A" : "#6B7280", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                              {c.vip ? "⭐ VIP" : "Regular"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FINANCIAL */}
          {activeSection === "financial" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Receita do Mês", value: "R$ 38.492", icon: "📈", color: "#2ECC71" },
                  { label: "Custos", value: "R$ 14.230", icon: "📉", color: "#EF4444" },
                  { label: "Lucro Líquido", value: "R$ 24.262", icon: "💰", color: "#3B82F6" },
                  { label: "Ticket Médio", value: "R$ 58,40", icon: "🎯", color: "#8B5CF6" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <p style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Fluxo de Caixa – Julho 2026</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "#F0F0EE", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📊 Excel</button>
                    <button style={{ background: "#FF4D00", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📄 PDF</button>
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F7F7F5" }}>
                      {["Data", "Descrição", "Entradas", "Saídas", "Saldo"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6B7280" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: "01/07", desc: "Vendas do dia", in: 1842, out: 0, saldo: 1842 },
                      { date: "01/07", desc: "Fornecedor insumos", in: 0, out: 680, saldo: 1162 },
                      { date: "02/07", desc: "Vendas do dia", in: 2134, out: 0, saldo: 3296 },
                      { date: "02/07", desc: "Aluguel", in: 0, out: 3200, saldo: 96 },
                      { date: "03/07", desc: "Vendas do dia", in: 1976, out: 0, saldo: 2072 },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F7F7F5" }}>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: "#9B9B9B" }}>{r.date}</td>
                        <td style={{ padding: "12px 14px", fontSize: 13 }}>{r.desc}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#2ECC71" }}>{r.in > 0 ? `R$ ${r.in.toFixed(2)}` : "—"}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#EF4444" }}>{r.out > 0 ? `R$ ${r.out.toFixed(2)}` : "—"}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 800, color: r.saldo >= 0 ? "#1A1A1A" : "#EF4444" }}>R$ {r.saldo.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MARKETING */}
          {activeSection === "marketing" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {[
                { title: "🎨 Banners Promocionais", desc: "Crie banners atrativos para sua loja", action: "Criar Banner" },
                { title: "📱 QR Code", desc: "Gere QR Code do seu cardápio digital", action: "Gerar QR Code" },
                { title: "📲 Link Curto", desc: "Crie links curtos para divulgação", action: "Criar Link" },
                { title: "💌 Campanha WhatsApp", desc: "Envie mensagens para todos os clientes", action: "Criar Campanha" },
                { title: "📧 Email Marketing", desc: "Envie emails segmentados para clientes", action: "Criar Email" },
                { title: "🎯 Pixel Meta", desc: "Configure o pixel do Facebook/Instagram", action: "Configurar" },
                { title: "📊 Google Analytics", desc: "Monitore o tráfego do seu cardápio", action: "Conectar" },
                { title: "🏷️ Cupons de Desconto", desc: "Crie cupons para atrair mais clientes", action: "Criar Cupom" },
              ].map((card, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{card.title}</h3>
                  <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16, lineHeight: 1.5 }}>{card.desc}</p>
                  <button onClick={() => showNotif(`${card.action} em desenvolvimento!`)} style={{
                    background: "#FF4D00", color: "#fff", border: "none", borderRadius: 10,
                    padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, width: "100%"
                  }}>{card.action}</button>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {activeSection === "settings" && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>🏪 Informações da Loja</h3>
                <div style={{ display: "grid", gap: 14 }}>
                  {[["Nome da Loja", "Burger House"], ["Categoria", "Hambúrgueres & Lanches"], ["Telefone / WhatsApp", "(11) 99999-0000"], ["Endereço", "Rua das Flores, 123 – SP"], ["Instagram", "@burgerhouse"], ["Pedido Mínimo", "R$ 25,00"], ["Taxa de Entrega", "R$ 5,00"]].map(([label, val]) => (
                    <div key={label}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
                      <input defaultValue={val} style={{ width: "100%", border: "2px solid #F0F0EE", borderRadius: 10, padding: "10px 14px", fontFamily: "'Inter', sans-serif", outline: "none" }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => showNotif("Configurações salvas!")} style={{ marginTop: 20, background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>Salvar Alterações</button>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16 }}>🕐 Horários de Funcionamento</h3>
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day, i) => (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ width: 80, fontSize: 14, fontWeight: 600 }}>{day}</span>
                    <input defaultValue="11:00" style={{ border: "2px solid #F0F0EE", borderRadius: 8, padding: "8px 10px", width: 80, fontFamily: "'Inter', sans-serif", outline: "none" }} />
                    <span style={{ color: "#9B9B9B" }}>–</span>
                    <input defaultValue={i === 6 ? "22:00" : "23:00"} style={{ border: "2px solid #F0F0EE", borderRadius: 8, padding: "8px 10px", width: 80, fontFamily: "'Inter', sans-serif", outline: "none" }} />
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "#FF4D00" }} /> Aberto
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI ASSISTANT */}
          {activeSection === "ai" && (
            <div style={{ maxWidth: 800 }}>
              <div style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)", borderRadius: 20, padding: 32, marginBottom: 24, color: "#fff" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ width: 56, height: 56, background: "#FF4D00", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🤖</div>
                  <div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Assistente de IA</h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Pergunte qualquer coisa sobre seu negócio de delivery</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && askAI()}
                    placeholder="Ex: Crie uma descrição para meu hambúrguer artesanal com bacon..."
                    style={{
                      flex: 1, border: "none", borderRadius: 12, padding: "14px 18px",
                      fontFamily: "'Inter', sans-serif", fontSize: 14, background: "rgba(255,255,255,0.1)",
                      color: "#fff", outline: "none"
                    }}
                  />
                  <button onClick={askAI} disabled={aiLoading} style={{
                    background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12,
                    padding: "14px 24px", fontWeight: 700, cursor: aiLoading ? "not-allowed" : "pointer",
                    opacity: aiLoading ? 0.7 : 1, fontFamily: "'Syne', sans-serif", whiteSpace: "nowrap"
                  }}>{aiLoading ? "⏳ Gerando..." : "Enviar →"}</button>
                </div>
              </div>

              {aiResponse && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: 24 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, background: "#FF4D00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
                    <div>
                      <p style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>Assistente de IA</p>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap" }}>{aiResponse}</p>
                    </div>
                  </div>
                  <button onClick={() => { navigator.clipboard?.writeText(aiResponse); showNotif("Copiado!"); }} style={{ background: "#F0F0EE", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📋 Copiar Resposta</button>
                </div>
              )}

              <div>
                <p style={{ fontSize: 13, color: "#9B9B9B", marginBottom: 14, fontWeight: 600 }}>💡 Sugestões rápidas:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {[
                    "Crie uma descrição criativa para um hambúrguer artesanal com queijo coalho e bacon",
                    "Gere 5 nomes criativos para batatas fritas especiais",
                    "Sugira uma estratégia de precificação para meu cardápio de delivery",
                    "Quais promoções funcionam melhor para aumentar o ticket médio em delivery?",
                    "Escreva um texto de campanha para o WhatsApp anunciando nova pizza",
                    "Analise: vendo 50 hambúrgueres/dia, como aumentar para 70?",
                  ].map((q, i) => (
                    <button key={i} onClick={() => { setAiQuery(q); }} style={{
                      background: "#F7F7F5", border: "2px solid #F0F0EE", borderRadius: 20,
                      padding: "8px 16px", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                      color: "#374151", lineHeight: 1.4, textAlign: "left", transition: "all 0.2s"
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF4D00"; e.currentTarget.style.color = "#FF4D00"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0F0EE"; e.currentTarget.style.color = "#374151"; }}
                    >{q}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [area, setArea] = useState("customer");

  return area === "customer"
    ? <CustomerArea onSwitchToAdmin={() => setArea("admin")} />
    : <AdminArea onSwitchToCustomer={() => setArea("customer")} />;
}
