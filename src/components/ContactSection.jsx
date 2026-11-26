import { lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import { ExperienceContext } from "../experience.jsx";
import { asset } from "../data/content.js";
const FooterCanvas = lazy(() => import("./FooterCanvas.jsx"));
import LineTextAnimation from "./LineTextAnimation.jsx";

export default function ContactSection({ t }) {
  const { phase, reducedMotion } = useContext(ExperienceContext);
  const footerRef = useRef(null);
  const [loadScene, setLoadScene] = useState(false);
  const [isQrVisible, setIsQrVisible] = useState(false);
  const moreInfoLabel =
    t.contactMore === "更多信息" ? t.contactMore : "FOR MORE INFORMATION";
  const addressValue =
    t.contactAddressValue ===
    "Shanghai, YangPu District, 88Zhengxue rd. Building 5, 1005"
      ? "YangPu District, 88Zhengxue rd. Building 5, 1005"
      : t.contactAddressValue;

  useEffect(() => {
    if (phase !== "content") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoadScene(true); observer.disconnect(); }
    }, { rootMargin: "180px" });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [phase]);

  return (
    <footer className="contactFooter" id="contact" ref={footerRef}>
      <div className="footer-container">
        {loadScene && <Suspense fallback={null}><FooterCanvas reducedMotion={reducedMotion} /></Suspense>}

        <div className="footer-content contactWrap">
          <div className="contactFooterInfo">
            <div className="contactFooterGroup contactFooterJoin">
              <div className="contactLabel">
                {t.contactJoin} / {t.contactBusiness}
              </div>
              <span className="contactText">mii@mahelei.com</span>
            </div>

            <div className="contactFooterGroup contactFooterMore">
              <div className="contactLabel">{moreInfoLabel}</div>
              <a
                className="contactLink"
                href="https://www.xiaohongshu.com/user/profile/5e1ac89200000000010015a1"
                target="_blank"
                rel="noreferrer"
              >
                <span>{t.contactXiaohongshu}</span>
              </a>
              <button
                className="contactLink contactWechatButton"
                type="button"
                aria-expanded={isQrVisible}
                onClick={() => setIsQrVisible((visible) => !visible)}
              >
                <span>{t.contactWechat}</span>
              </button>
              <img
                className={`contactQr ${isQrVisible ? "is-visible" : ""}`}
                src={asset("ContactInfo/mahoo_qr_clean.png")}
                alt="Mahoo Lab QR code"
              />
            </div>
          </div>

          <div className="contactFooterGroup contactFooterAddress">
            <a
              className="contactAddressLink"
              href="https://api.map.baidu.com/direction?destination=%E4%B8%8A%E6%B5%B7%E5%B8%82%E6%9D%A8%E6%B5%A6%E5%8C%BA%E6%94%BF%E5%AD%A6%E8%B7%AF88%E5%8F%B75%E5%8F%B7%E6%A5%BC1005%E5%AE%A4&mode=driving&region=%E4%B8%8A%E6%B5%B7&output=html"
              target="_blank"
              rel="noreferrer"
              aria-label={t.contactAddress}
            >
              ↗
            </a>
            <span className="contactAddressText">{addressValue}</span>
            <span className="contactCity">Shanghai</span>
          </div>

          <LineTextAnimation as="h2" className="contactTitle">
            Contact Us
          </LineTextAnimation>

          <div className="footer-row contactFooterBottom">
            <span>@Mahoo Lab 2026 | All Rights Reserved</span>
            <span>Shanghai | Creative Technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
