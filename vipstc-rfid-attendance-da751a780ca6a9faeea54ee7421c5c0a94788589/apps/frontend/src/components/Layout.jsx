import React from 'react';
import leftLogo from './assets/banner-left.webp'
import rightLogo from './assets/banner-right.webp'

export default function Layout({ children }) {
  return (
    <>
      <header className="banner">
        <img src={leftLogo} alt="VIPS Logo" />
        <div className="title">
          Vivekananda Institute of Professional Studies – Technical Campus<br/>
          Vivekananda School of Information Technology
        </div>
        <img src={rightLogo} alt="Campus Crest" />
      </header>
      <main>{children}</main>
    </>
  );
}
