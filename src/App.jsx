import React, { useState, useEffect, useRef } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import './index.css';

const API_BASE = '/api'; // Menggunakan jembatan proxy Vercel
const discordSdk = new DiscordSDK('1563451174055579698');

const SYMBOLS = [
  { id: 'lemon', icon: '🍋', color: 'text-yellow-400' },
  { id: 'cherry', icon: '🍒', color: 'text-red-500' },
  { id: 'grape', icon: '🍇', color: 'text-purple-500' },
  { id: 'seven', icon: '7️⃣', color: 'text-red-600' },
  { id: 'bell', icon: '🔔', color: 'text-yellow-500' },
  { id: 'orange', icon: '🍊', color: 'text-orange-500' },
  { id: 'diamond', icon: '💎', color: 'text-cyan-400' }
];

const getRandomGrid = () => {
  return Array(3).fill(null).map(() => 
    Array(3).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
  );
};

function App() {
  const [userId, setUserId] = useState('123456789'); // ID Sementara
  const [userName, setUserName] = useState('Hafizh'); // Nama default sebelum load Discord
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(500);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState(getRandomGrid());
  const spinInterval = useRef(null);

  // Inisialisasi Discord SDK
 // Inisialisasi Discord SDK untuk mengambil profil asli
  useEffect(() => {
    const setupDiscord = async () => {
      try {
        await discordSdk.ready();
        console.log("Discord SDK Ready!");
        
        // Meminta otorisasi dari Discord
        const { code } = await discordSdk.commands.authorize({
          client_id: '1563451174055579698',
          response_type: "code",
          state: "",
          prompt: "none",
          scope: ["identify", "guilds"]
        });

        // Mengambil data profil pengguna yang sedang login di Discord
        let auth = await discordSdk.commands.authenticate({ code });
        if (auth && auth.user) {
          setUserName(auth.user.username); // Mengubah 'NightRider' menjadi nama asli Discord!
          setUserId(auth.user.id);         // Menggunakan ID Discord asli untuk Supabase/Database
        }
      } catch (e) {
        console.log("Berjalan di browser biasa atau gagal memuat Discord SDK:", e);
      }
    };
    setupDiscord();
  }, []);

  // Ambil data Saldo
  useEffect(() => {
    fetch(`${API_BASE}/user/${userId}`)
      .then(res => res.json())
      .then(data => { if(data && data.balance !== undefined) setBalance(data.balance); })
      .catch(err => console.error(err));
  }, [userId]);

  // Fungsi Spin
  const handleSpin = async () => {
    if (balance < bet || isSpinning) return;
    setIsSpinning(true);
    spinInterval.current = setInterval(() => setGrid(getRandomGrid()), 50);

    try {
      const response = await fetch(`${API_BASE}/spin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bet })
      });
      const data = await response.json();

      if(data.error) {
        alert(`❌ ${data.error}`);
        clearInterval(spinInterval.current);
        setIsSpinning(false);
        return;
      }

      setTimeout(() => {
        clearInterval(spinInterval.current);
        setIsSpinning(false);
        setBalance(data.balance);
        const finalGrid = getRandomGrid();
        if (data.result === 'JACKPOT') finalGrid[1] = [SYMBOLS[3], SYMBOLS[3], SYMBOLS[3]];
        else if (data.result === 'PAIR') finalGrid[1] = [SYMBOLS[1], SYMBOLS[1], SYMBOLS[0]];
        setGrid(finalGrid);
      }, 2000);
    } catch(e) {
      clearInterval(spinInterval.current);
      setIsSpinning(false);
      alert("Gagal menghubungi server game.");
    }
  };

  // Fungsi Daily
  const handleDaily = async () => {
    try {
      const res = await fetch(`${API_BASE}/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if(data.error) alert(`❌ ${data.error}`);
      else {
        alert(`🎁 Klaim Berhasil! +${data.reward} HZC\nStreak: ${data.currentStreak} Hari`);
        setBalance(data.newBalance);
      }
    } catch(e) { alert("Gagal menghubungi server."); }
  };

  return (
    <div className="min-h-screen bg-hueza-bg text-white p-4 font-sans flex flex-col items-center">
      
      {/* TOP NAVIGATION BAR */}
      <div className="w-full max-w-[1400px] flex justify-between items-center bg-hueza-panel px-6 py-3 rounded-2xl mb-6 shadow-lg border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-hueza-pink to-hueza-purple rounded-full flex items-center justify-center border-2 border-hueza-gold shadow-[0_0_10px_#FACC15]">
            <span className="font-black text-xs">HZC</span>
          </div>
          <h1 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-300">
            HuezaChip
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">👾</div>
             <div className="flex flex-col">
                {/* NAMA DINAMIS DISINI */}
                <span className="text-sm font-bold flex items-center gap-1">{userName} <span className="text-hueza-gold text-xs">👑</span></span>
                <span className="text-[10px] text-green-400 flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Online</span>
             </div>
          </div>
          <div className="bg-[#0A0516] px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-5 h-5 bg-hueza-gold rounded-full flex items-center justify-center text-black text-[10px] font-black">H</div>
            <span className="font-bold">{balance.toLocaleString()} HZC</span>
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD LAYOUT */}
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-hueza-panel p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
            <button className="flex justify-between items-center w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition">
               <span className="flex items-center gap-3 font-semibold"><span className="text-hueza-gold">🎰</span> Lucky Spin</span>
               <span className="bg-hueza-purple text-xs px-2 py-1 rounded">HOT</span>
            </button>
            <button onClick={handleDaily} className="flex items-center gap-3 w-full hover:bg-white/5 p-3 rounded-xl transition text-white font-semibold">
               <span>📅</span> Claim Daily Reward
            </button>
          </div>
          <div className="bg-gradient-to-br from-hueza-panel to-hueza-machine-outer p-4 rounded-2xl border border-hueza-purple/30 flex items-center gap-4 mt-auto">
             <div className="w-12 h-12 bg-[#0A0516] rounded-full flex items-center justify-center border-2 border-hueza-purple text-xs font-black">HZC</div>
             <div>
                <p className="font-bold text-sm">Play Smart,</p>
                <p className="font-bold text-sm">Win Bigger!</p>
             </div>
          </div>
        </div>

        {/* KOLOM TENGAH (MESIN) */}
        <div className="lg:col-span-2 flex justify-center items-start">
          <div className="w-full max-w-[600px] bg-hueza-machine-outer rounded-[40px] p-3 relative shadow-[0_0_50px_rgba(42,16,78,0.8)] border-b-8 border-r-8 border-[#1A0A33]">
            <div className="absolute top-1/3 -right-6 w-6 h-32 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-r-xl border-2 border-[#1A0A33] z-0"></div>
            <div className="absolute top-1/3 -right-10 w-10 h-10 bg-hueza-purple rounded-full shadow-[0_0_15px_#8B31FF] border-2 border-white/20 z-0"></div>

            <div className="bg-hueza-machine-inner w-full h-full rounded-[30px] border-4 border-hueza-gold/80 p-6 relative z-10 flex flex-col items-center">
              <div className="absolute -top-6 bg-hueza-machine-inner px-6 py-1 border-4 border-hueza-gold rounded-full flex flex-col items-center">
                 <span className="text-hueza-gold text-2xl -mt-4">👑</span>
                 <h2 className="text-2xl font-black italic text-white drop-shadow-md tracking-wider -mt-1">HuezaChip</h2>
              </div>

              <div className="w-full bg-[#0A0314] rounded-2xl border-[3px] border-hueza-gold/50 p-3 mt-8 shadow-inner relative overflow-hidden">
                 <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0"></div>
                 <div className={`grid grid-cols-3 gap-3 w-full h-full relative z-10 transition-all duration-100 ${isSpinning ? 'spin-blur' : ''}`}>
                    {grid.map((column, colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-3">
                         {column.map((sym, rowIdx) => (
                           <div key={rowIdx} className="bg-gradient-to-b from-gray-900 to-black rounded-xl h-[90px] border border-white/5 flex justify-center items-center text-5xl shadow-inner">
                              <span className={`drop-shadow-lg ${sym.color}`}>{sym.icon}</span>
                           </div>
                         ))}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="w-full flex justify-between items-center mt-6 gap-4">
                 <div className="flex-1 bg-[#0A0314] rounded-2xl border border-white/10 p-2 flex items-center justify-between">
                    <button onClick={() => setBet(b => Math.max(100, b - 100))} disabled={isSpinning} className="w-10 h-10 bg-white/5 rounded-full hover:bg-white/10 font-bold">-</button>
                    <div className="flex flex-col items-center">
                       <span className="text-[10px] text-gray-400">BET</span>
                       <span className="font-bold text-xl">{bet}</span>
                    </div>
                    <button onClick={() => setBet(b => Math.min(10000, b + 100))} disabled={isSpinning} className="w-10 h-10 bg-white/5 rounded-full hover:bg-white/10 font-bold">+</button>
                 </div>

                 <button onClick={handleSpin} disabled={isSpinning} className={`flex-1 py-4 rounded-2xl font-black text-2xl tracking-widest italic transition-all duration-200 flex justify-center items-center gap-2 ${isSpinning ? 'bg-gray-800 text-gray-500 scale-95' : 'bg-gradient-to-b from-hueza-pink to-purple-600 text-white border-b-4 border-purple-800 hover:brightness-110 active:border-b-0 active:translate-y-1 glow-pink'}`}>
                   <span>⚡</span> {isSpinning ? '...' : 'SPIN'}
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-hueza-panel p-5 rounded-2xl border border-white/5">
             <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><span className="text-hueza-gold">👑</span> Paytable</h3>
             <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                   <span className="text-3xl drop-shadow-md">7️⃣</span>
                   <div className="flex flex-col"><span className="text-hueza-gold font-bold text-sm">Jackpot</span><span className="text-xs text-gray-400">10x Bet</span></div>
                </div>
                <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                   <span className="text-3xl drop-shadow-md">🔔</span>
                   <div className="flex flex-col"><span className="text-white font-bold text-sm">Pair</span><span className="text-xs text-gray-400">1.8x Bet</span></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
