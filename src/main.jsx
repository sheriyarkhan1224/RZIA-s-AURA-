import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {supabase} from "./supabase";
import "./styles.css";

const money = (n,c) => c==="BDT" ? `৳${Number(n||0).toLocaleString()}` : c==="EUR" ? `€${Number(n||0).toLocaleString()}` : `Rs. ${Number(n||0).toLocaleString()}`;

function App(){
  const [products,setProducts]=useState([]),[collections,setCollections]=useState([]),[settings,setSettings]=useState(null);
  const [currency,setCurrency]=useState("PKR"),[cart,setCart]=useState([]),[user,setUser]=useState(null);
  const [page,setPage]=useState("home"),[selected,setSelected]=useState(null),[auth,setAuth]=useState(false);
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState("");
  const [message,setMessage]=useState("");

  async function load(){
    const [p,c,s]=await Promise.all([
      supabase.from("products").select("*").eq("visible",true).order("created_at",{ascending:false}),
      supabase.from("collections").select("*").eq("visible",true).order("created_at",{ascending:false}),
      supabase.from("site_settings").select("*").eq("id",1).single()
    ]);
    setProducts(p.data||[]);setCollections(c.data||[]);setSettings(s.data||null);
  }
  useEffect(()=>{load();supabase.auth.getSession().then(({data})=>setUser(data.session?.user||null));const {data}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>data.subscription.unsubscribe()},[]);
  const add=(p)=>setCart(x=>[...x,{product:p,qty:1}]);
  const total=useMemo(()=>cart.reduce((a,x)=>a+Number(x.product[`price_${currency.toLowerCase()}`]||0)*x.qty,0),[cart,currency]);

  async function signup(){
    const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
    setMessage(error?error.message:"Account created. Check your email if confirmation is enabled.");
  }
  async function login(){
    const {error}=await supabase.auth.signInWithPassword({email,password});
    setMessage(error?error.message:"Logged in.");
  }
  async function logout(){await supabase.auth.signOut();setPage("home")}

  async function checkout(){
    if(!user){setAuth(true);setMessage("Please login before checkout.");return}
    if(!cart.length)return;
    const subtotal=total;
    const {data:profile}=await supabase.from("profiles").select("full_name,phone").eq("id",user.id).single();
    const {data:order,error}=await supabase.from("orders").insert({
      user_id:user.id,customer_name:profile?.full_name||user.email,email:user.email,phone:profile?.phone||"",
      address:"Add address in your account",city:"",country:"Pakistan",currency,
      subtotal,shipping:0,total,payment_method:"cod"
    }).select().single();
    if(error){setMessage(error.message);return}
    const items=cart.map(x=>({order_id:order.id,product_id:x.product.id,product_name:x.product.name,image_url:x.product.images?.[0]||null,size:null,colour:null,quantity:x.qty,unit_price:Number(x.product[`price_${currency.toLowerCase()}`]||0),line_total:Number(x.product[`price_${currency.toLowerCase()}`]||0)*x.qty}));
    await supabase.from("order_items").insert(items);
    setCart([]);setMessage(`Order #${order.order_number} placed successfully.`);setPage("home");
  }

  const hero=settings?.hero_image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=85";
  return <div>
    <div className="announce">{settings?.announcement||"ELEGANCE, REIMAGINED"}</div>
    <header><button className="icon" onClick={()=>setPage("home")}>☰</button><div className="logo">RZIA’S AURA</div><nav><button onClick={()=>setPage("shop")}>SHOP</button><button onClick={()=>setPage("collections")}>COLLECTIONS</button><button onClick={()=>setPage("new")}>NEW ARRIVALS</button></nav><div className="actions"><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>PKR</option><option>BDT</option><option>EUR</option></select><button onClick={()=>setPage("cart")}>BAG ({cart.length})</button><button onClick={()=>setAuth(true)}>{user?"ACCOUNT":"LOGIN"}</button></div></header>

    {page==="home" && <><section className="hero"><img src={hero}/><div><p>RZIA’S AURA</p><h1>{settings?.hero_title||"The Art of Elegance"}</h1><span>{settings?.hero_text||"Modern silhouettes, graceful detail and timeless confidence."}</span><button onClick={()=>setPage("shop")}>SHOP NOW</button></div></section>
      <section className="section"><h2>NEW ARRIVALS</h2><div className="grid">{products.filter(p=>p.new_arrival).slice(0,8).map(p=><Card key={p.id} p={p} onClick={()=>{setSelected(p);setPage("product")}} currency={currency}/>)}</div></section>
      <section className="section"><h2>FEATURED</h2><div className="grid">{products.filter(p=>p.featured).slice(0,8).map(p=><Card key={p.id} p={p} onClick={()=>{setSelected(p);setPage("product")}} currency={currency}/>)}</div></section>
    </>}

    {page==="shop"||page==="new" && <section className="section"><h1>{page==="new"?"NEW ARRIVALS":"SHOP"}</h1><div className="grid">{(page==="new"?products.filter(p=>p.new_arrival):products).map(p=><Card key={p.id} p={p} onClick={()=>{setSelected(p);setPage("product")}} currency={currency}/>)}</div></section>}
    {page==="collections" && <section className="section"><h1>COLLECTIONS</h1><div className="collectionGrid">{collections.map(c=><div className="collection" key={c.id}><img src={c.image_url}/><h2>{c.name}</h2><p>{c.description}</p><button onClick={()=>setPage("shop")}>EXPLORE</button></div>)}</div></section>}
    {page==="product"&&selected&&<Product p={selected} currency={currency} add={add} back={()=>setPage("shop")}/>}
    {page==="cart"&&<Cart cart={cart} currency={currency} total={total} checkout={checkout}/>}
    <footer><div><b>RZIA’S AURA</b><p>{settings?.story_text||"Elegance, royalty and modern fashion."}</p></div><div><b>CONTACT</b><p>{settings?.email||"hello@rziasaura.com"}<br/>{settings?.address||"Pakistan"}</p></div><div><b>POLICIES</b><p>Shipping<br/>Returns & Exchange<br/>Privacy Policy</p></div><div><b>FOLLOW</b><p>{settings?.instagram||"Instagram"}<br/>{settings?.facebook||"Facebook"}<br/>{settings?.tiktok||"TikTok"}</p></div></footer>

    {auth&&<div className="modal"><div className="modalbox"><button className="close" onClick={()=>setAuth(false)}>×</button><h2>{user?"ACCOUNT":"CUSTOMER LOGIN"}</h2>{user?<><p>Signed in as {user.email}</p><button onClick={logout}>LOG OUT</button></>:<><input placeholder="Full name (signup)" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={login}>LOGIN</button><button className="secondary" onClick={signup}>CREATE ACCOUNT</button></>}<p className="message">{message}</p></div></div>}
  </div>
}

function Card({p,onClick,currency}){let price=p[`price_${currency.toLowerCase()}`];return <article className="card" onClick={onClick}><div className="photo">{p.images?.[0]?<img src={p.images[0]}/>:<div className="placeholder">RZIA’S AURA</div>}{p.badge&&<b>{p.badge}</b>}</div><h3>{p.name}</h3><p>{money(price,currency)}</p></article>}
function Product({p,currency,add,back}){return <section className="product"><button onClick={back}>← BACK</button><div className="productWrap"><div className="gallery">{(p.images?.length?p.images:[""]).map((x,i)=>x?<img key={i} src={x}/>:<div className="placeholder"/>)}</div><div><p>{p.category}</p><h1>{p.name}</h1><h2>{money(p[`price_${currency.toLowerCase()}`],currency)}</h2><p>{p.description}</p><p><b>Sizes:</b> {(p.sizes||[]).join(" · ")||"Available on request"}</p><p><b>Colours:</b> {(p.colours||[]).join(" · ")||"—"}</p><p><b>Stock:</b> {p.stock}</p><button onClick={()=>add(p)}>ADD TO BAG</button></div></div></section>}
function Cart({cart,currency,total,checkout}){return <section className="section"><h1>YOUR BAG</h1>{!cart.length?<p>Your bag is empty.</p>:<><div>{cart.map((x,i)=><div className="cartitem" key={i}><span>{x.product.name}</span><span>{x.qty} × {money(x.product[`price_${currency.toLowerCase()}`],currency)}</span></div>)}</div><h2>Total: {money(total,currency)}</h2><button onClick={checkout}>PLACE ORDER</button></>}</section>}
createRoot(document.getElementById("root")).render(<App/>);