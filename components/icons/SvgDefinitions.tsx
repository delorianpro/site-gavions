import styles from "@/components/icons/SvgDefinitions.module.css";

export function SvgDefinitions() {
  return (
    <svg className={styles.sprite} width={0} height={0} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1120" />
          <stop offset="1" stopColor="#1b2639" />
        </linearGradient>
        <radialGradient id="g-lamp">
          <stop offset="0" stopColor="#ffe9b8" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffe9b8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f5d8c" />
          <stop offset="1" stopColor="#a7b6c9" />
        </linearGradient>
        <linearGradient id="g-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a475e" />
          <stop offset="1" stopColor="#2a364c" />
        </linearGradient>
        <g id="bg-gate">
          <rect width={160} height={90} fill="url(#g-night)" />
          <circle cx="130" cy="22" r="42" fill="url(#g-lamp)" />
          <rect y="30" width={160} height={32} fill="#162034" />
          <rect y="28" width={160} height={3} fill="#1f2b44" />
          <rect x="62" y="20" width={58} height={42} fill="#0f1828" />
          <path d="M66 22v40M72 22v40M78 22v40M84 22v40M90 22v40M96 22v40M102 22v40M108 22v40M114 22v40" stroke="#2c3a58" strokeWidth="1.4" />
          <path d="M62 21h58M62 41h58M62 61h58" stroke="#34446a" strokeWidth="1.6" />
          <rect x="129" y="16" width={2} height={46} fill="#2a3552" />
          <rect x="124" y="14" width={12} height={3} rx="1.5" fill="#f5e6c4" />
          <rect y="62" width={160} height={28} fill="#1e2738" />
          <path d="M0 62h160" stroke="#2f3b55" strokeWidth=".8" />
        </g>
        <g id="fig-person"><ellipse cx="44" cy="79.5" rx="8" ry="1.6" fill="#05080f" opacity=".6" /><circle cx="44" cy="43" r="3.8" fill="#05080f" /><path d="M39.2 48.6q4.8-2.6 9.6 0l1.7 13.2-2.3.7-.9 17h-3l-.8-12.4-.8 12.4h-3l-.9-17-2.3-.7z" fill="#05080f" /></g>
        <g id="bg-park">
          <rect width={160} height={90} fill="url(#g-night)" />
          <rect y="14" width={160} height={26} fill="#121b2e" />
          <g fill="#24324f"><rect x="10" y="20" width={8} height={5} /><rect x="24" y="20" width={8} height={5} /><rect x="38" y="20" width={8} height={5} /><rect x="10" y="30" width={8} height={5} /><rect x="38" y="30" width={8} height={5} /><rect x="118" y="20" width={8} height={5} /><rect x="132" y="20" width={8} height={5} /><rect x="132" y="30" width={8} height={5} /></g>
          <g fill="#d9c79a" opacity=".5"><rect x="24" y="30" width={8} height={5} /><rect x="118" y="30" width={8} height={5} /></g>
          <rect y="40" width={160} height={50} fill="#1d2637" />
          <path d="M14 90 34 40M54 90 64 40M94 90V40M134 90 124 40" stroke="#36435e" strokeWidth="1" />
          <circle cx="20" cy="10" r="30" fill="url(#g-lamp)" opacity=".7" />
        </g>
        <g id="fig-car"><ellipse cx="99" cy="75" rx="30" ry="2.4" fill="#05080f" opacity=".6" /><path d="M70 70v-6q0-5 6-6l9-1 8-7q3-2 7-2h12q5 0 8 3l6 6 6 1q4 1 4 5v7z" fill="#0a0f1b" /><path d="M90 56l6-5q2-1 4-1h4v6zM107 50h5q3 0 5 2l4 4h-14z" fill="#33476b" /><circle cx="84" cy="71" r="5" fill="#03050a" /><circle cx="116" cy="71" r="5" fill="#03050a" /><circle cx="84" cy="71" r="2" fill="#2a3346" /><circle cx="116" cy="71" r="2" fill="#2a3346" /><rect x="125" y="61" width={3} height={2} rx="1" fill="#ffe4a8" /></g>
        <g id="bg-ware">
          <rect width={160} height={90} fill="url(#g-in)" />
          <path d="M0 64h160v26H0z" fill="#384761" />
          <path d="M80 64 30 90M80 64l50 26M80 64v26" stroke="#44546f" strokeWidth=".8" />
          <g fill="#c9d6ec" opacity=".8"><rect x="30" y="4" width={22} height={2} rx="1" /><rect x="108" y="4" width={22} height={2} rx="1" /></g>
          <g fill="#1b2538"><rect x="6" y="16" width="2.5" height={48} /><rect x="58" y="16" width="2.5" height={48} /><rect x="6" y="28" width={54} height={2} /><rect x="6" y="44" width={54} height={2} /><rect x="6" y="61" width={54} height={2} /><rect x="100" y="16" width="2.5" height={48} /><rect x="152" y="16" width="2.5" height={48} /><rect x="100" y="28" width={54} height={2} /><rect x="100" y="44" width={54} height={2} /><rect x="100" y="61" width={54} height={2} /></g>
          <g fill="#6a5f4d">
            <rect x="10" y="19" width={12} height={9} />
            <rect x="24" y="21" width={10} height={7} />
            <rect x="38" y="18" width={14} height={10} />
            <rect x="11" y="35" width={15} height={9} />
            <rect x="30" y="37" width={9} height={7} />
            <rect x="42" y="34" width={13} height={10} />
            <rect x="9" y="52" width={12} height={9} />
            <rect x="25" y="50" width={16} height={11} />
            <rect x="104" y="20" width={14} height={8} />
            <rect x="121" y="18" width={11} height={10} />
            <rect x="136" y="21" width={13} height={7} />
            <rect x="104" y="36" width={10} height={8} />
            <rect x="118" y="34" width={16} height={10} />
            <rect x="104" y="51" width={18} height={10} />
            <rect x="128" y="53" width={11} height={8} />
            <rect x="141" y="50" width={9} height={11} />
          </g>
        </g>
        <g id="bg-recep">
          <rect width={160} height={90} fill="#3b4760" />
          <rect y="66" width={160} height={24} fill="#4a5671" />
          <rect x="18" y="16" width={34} height={50} fill="#5d7fa8" />
          <path d="M35 16v50" stroke="#34405a" strokeWidth="1.5" />
          <rect x="18" y="16" width={34} height={50} fill="none" stroke="#2a3449" strokeWidth="2" />
          <rect x="84" y="50" width={56} height={18} rx="1" fill="#26304a" />
          <rect x="84" y="48" width={56} height={3} fill="#59647f" />
          <rect x="104" y="39" width={14} height={9} rx="1" fill="#1a2132" />
          <rect x="62" y="56" width={8} height={10} fill="#6b5a46" />
          <path d="M66 56c-6-4-7-12-3-16 1 5 3 8 3 16zm0 0c5-5 9-10 7-15-3 4-6 8-7 15z" fill="#3f6b55" />
          <rect x="100" y="8" width={44} height={2} fill="#dbe4f3" opacity=".8" />
        </g>
        <g id="bg-site">
          <rect width={160} height={90} fill="url(#g-sky)" />
          <rect y="64" width={160} height={26} fill="#5b5448" />
          <g fill="#2b3346"><rect x="70" y="20" width={3} height={44} /><rect x="92" y="20" width={3} height={44} /><rect x="114" y="20" width={3} height={44} /><rect x="136" y="20" width={3} height={44} /><rect x="66" y="20" width={76} height={3} /><rect x="66" y="34" width={76} height={3} /><rect x="66" y="49" width={76} height={3} /></g>
          <path d="M30 64V6h52M30 6 18 12h12M30 12l6-6M74 6v14" stroke="#d9a54d" strokeWidth="1.6" fill="none" />
          <path d="M8 64q13-14 28 0z" fill="#7a6b55" />
        </g>
        <g id="fig-truck"><ellipse cx="57" cy="73" rx="24" ry="1.8" fill="#05080f" opacity=".5" /><path d="M36 52h28v16H36z" fill="#d6dbe3" /><path d="M64 58h9l5 5v5H64z" fill="#9aa5b8" /><path d="M66 59.5h5.5l3 3h-8.5z" fill="#2d3b55" /><circle cx="44" cy="69" r="3.6" fill="#10141c" /><circle cx="70" cy="69" r="3.6" fill="#10141c" /></g>
      </defs>
      <symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></symbol>
      <symbol id="i-shield-off" viewBox="0 0 24 24"><path d="m2 2 20 20" /><path d="M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.86-3.73" /><path d="M9.31 3.65a12.25 12.25 0 0 0 1.93-1.37 1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.8 9.8 0 0 1-.08 1.26" /></symbol>
      <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></symbol>
      <symbol id="i-siren" viewBox="0 0 24 24"><path d="M7 18v-6a5 5 0 1 1 10 0v6" /><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" /><path d="M21 12h1M18.5 4.5 18 5M2 12h1M12 2v1M4.93 4.93l.7.7M12 12v6" /></symbol>
      <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6M10 22h4" /></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></symbol>
      <symbol id="i-calendar" viewBox="0 0 24 24"><rect width={18} height={18} x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></symbol>
      <symbol id="i-play" viewBox="0 0 24 24"><path d="M6 3l14 9-14 9z" /></symbol>
      <symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></symbol>
      <symbol id="i-building" viewBox="0 0 24 24"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" /></symbol>
      <symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></symbol>
      <symbol id="i-signal" viewBox="0 0 24 24"><path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" /></symbol>
      <symbol id="i-lock" viewBox="0 0 24 24"><rect width={18} height={11} x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></symbol>
      <symbol id="i-server" viewBox="0 0 24 24"><rect width={20} height={8} x="2" y="2" rx="2" /><rect width={20} height={8} x="2" y="14" rx="2" /><path d="M6 6h.01M6 18h.01" /></symbol>
      <symbol id="i-eye-off" viewBox="0 0 24 24"><path d="M10.73 5.08A10.7 10.7 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61M2 2l20 20M9.88 9.88a3 3 0 1 0 4.24 4.24" /></symbol>
      <symbol id="i-video" viewBox="0 0 24 24"><path d="m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5" /><rect x="2" y="6" width={14} height={12} rx="2" /></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></symbol>
      <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></symbol>
      <symbol id="i-chevron-r" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></symbol>
      <symbol id="i-back" viewBox="0 0 24 24"><path d="m12 19-7-7 7-7M19 12H5" /></symbol>
      <symbol id="i-map" viewBox="0 0 24 24"><path d="M14.1 5.55a2 2 0 0 0 1.8 0l3.65-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.27a2 2 0 0 1-1.8 0l-4.2-2.1a2 2 0 0 0-1.8 0l-3.65 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9L8.1 3.45a2 2 0 0 1 1.8 0z" /><path d="M15 5.76v15M9 3.24v15" /></symbol>
      <symbol id="i-zap" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></symbol>
      <symbol id="i-hand" viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></symbol>
      <symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.5" /><path d="M12 8.5v6.5M8 11l4-2 4 2M9.5 21l2.5-6 2.5 6" /></symbol>
      <symbol id="i-car" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></symbol>
      <symbol id="i-truck" viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></symbol>
      <symbol id="i-bike" viewBox="0 0 24 24"><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></symbol>
      <symbol id="i-paw" viewBox="0 0 24 24"><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" /></symbol>
      <symbol id="i-drive" viewBox="0 0 24 24"><path d="M22 12H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01" /></symbol>
      <symbol id="i-activity" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></symbol>
      <symbol id="i-alert" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4M12 17h.01" /></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14" /></symbol>
      <symbol id="i-home" viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></symbol>
      <symbol id="i-grid" viewBox="0 0 24 24"><rect width={7} height={7} x="3" y="3" rx="1" /><rect width={7} height={7} x="14" y="3" rx="1" /><rect width={7} height={7} x="14" y="14" rx="1" /><rect width={7} height={7} x="3" y="14" rx="1" /></symbol>
      <symbol id="i-account" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.66V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.66" /></symbol>
      <symbol id="i-router" viewBox="0 0 24 24"><rect width={20} height={8} x="2" y="14" rx="2" /><path d="M6.01 18H6M10.01 18H10M15 10v4M17.84 7.17a4 4 0 0 0-5.66 0M20.66 4.34a8 8 0 0 0-11.31 0" /></symbol>
      <symbol id="i-camera" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" /><circle cx="12" cy="13" r="3" /></symbol>
      <symbol id="i-flag" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" /></symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></symbol>
      <symbol id="i-sparkles" viewBox="0 0 24 24"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z" /></symbol>
      <symbol id="i-headset" viewBox="0 0 24 24"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" /><path d="M21 16v2a4 4 0 0 1-4 4h-5" /></symbol>
      <symbol id="i-hardhat" viewBox="0 0 24 24"><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5M14 6a6 6 0 0 1 6 6v3M4 15v-3a6 6 0 0 1 6-6" /><rect x="2" y="15" width={20} height={4} rx="1" /></symbol>
      <symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12M6 14h12" /><rect width={12} height={12} x="6" y="10" /></symbol>
      <symbol id="i-store" viewBox="0 0 24 24"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4M2 7h20M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" /></symbol>
      <symbol id="i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></symbol>
      <symbol id="i-cloud-off" viewBox="0 0 24 24"><path d="m2 2 20 20M5.78 5.78A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.31-.19M21.53 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7 7 0 0 0 10 5.07" /></symbol>
      <symbol id="i-wrench" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" /></symbol>
      <symbol id="i-phone" viewBox="0 0 24 24"><rect width={14} height={20} x="5" y="2" rx="2" /><path d="M12 18h.01" /></symbol>
      <symbol id="i-maximize" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></symbol>
      <symbol id="i-receipt" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11" /></symbol>
      <symbol id="i-wa" viewBox="0 0 24 24">
        <path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z" />
      </symbol>
    </svg>
  );
}
