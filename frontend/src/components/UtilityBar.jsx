import React, { useState, useCallback } from 'react'

export default function UtilityBar() {
  const [showHelp, setShowHelp] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('INR');

  return (
    <>
      <div className="utility-bar py-2 text-white">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <a href="tel:+1800STAYVERSE" className="me-4 small d-none d-md-inline text-white text-decoration-none">
              <i className="fa fa-phone me-2"></i> +1 800 STAYVERSE
            </a>
            <a href="mailto:support@stayverse.com" className="small d-none d-md-inline text-white text-decoration-none">
              <i className="fa fa-envelope me-2"></i> support@stayverse.com
            </a>
          </div>
          <div className="d-flex align-items-center">
            <div className="dropdown me-3">
              <button className="btn btn-link btn-sm text-white text-decoration-none dropdown-toggle p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="fa fa-globe me-1"></i> {language}
              </button>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li><button className={`dropdown-item small ${language === 'EN' ? 'active' : ''}`} onClick={() => setLanguage('EN')}>English</button></li>
                <li><button className={`dropdown-item small ${language === 'ES' ? 'active' : ''}`} onClick={() => setLanguage('ES')}>Español</button></li>
                <li><button className={`dropdown-item small ${language === 'FR' ? 'active' : ''}`} onClick={() => setLanguage('FR')}>Français</button></li>
              </ul>
            </div>
            <div className="dropdown me-3">
              <button className="btn btn-link btn-sm text-white text-decoration-none dropdown-toggle p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {currency}
              </button>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li><button className={`dropdown-item small ${currency === 'USD' ? 'active' : ''}`} onClick={() => setCurrency('USD')}>USD $</button></li>
                <li><button className={`dropdown-item small ${currency === 'EUR' ? 'active' : ''}`} onClick={() => setCurrency('EUR')}>EUR €</button></li>
                <li><button className={`dropdown-item small ${currency === 'INR' ? 'active' : ''}`} onClick={() => setCurrency('INR')}>INR ₹</button></li>
              </ul>
            </div>
            <button className="btn btn-link btn-sm text-white text-decoration-none p-0" onClick={() => setShowHelp(true)}>
              <i className="fa fa-question-circle me-1"></i> Help
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} tabIndex="-1" onClick={() => setShowHelp(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: 20 }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="fa fa-question-circle me-2 text-primary"></i>
                  Help & Support
                </h5>
                <button type="button" className="close" onClick={() => setShowHelp(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="list-group list-group-flush">
                  <a href="mailto:support@stayverse.com" className="list-group-item list-group-item-action d-flex align-items-center py-3 border-0">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className="fa fa-envelope text-primary"></i>
                    </div>
                    <div>
                      <strong>Email Support</strong><br />
                      <small className="text-muted">support@stayverse.com</small>
                    </div>
                  </a>
                  <a href="tel:+1800STAYVERSE" className="list-group-item list-group-item-action d-flex align-items-center py-3 border-0">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className="fa fa-phone text-success"></i>
                    </div>
                    <div>
                      <strong>Call Us</strong><br />
                      <small className="text-muted">+1 800 STAYVERSE</small>
                    </div>
                  </a>
                  <div className="list-group-item d-flex align-items-center py-3 border-0">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className="fa fa-clock-o text-warning"></i>
                    </div>
                    <div>
                      <strong>Business Hours</strong><br />
                      <small className="text-muted">Mon-Fri: 9 AM - 8 PM EST</small>
                    </div>
                  </div>
                  <div className="list-group-item d-flex align-items-center py-3 border-0">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className="fa fa-commenting text-info"></i>
                    </div>
                    <div>
                      <strong>FAQ</strong><br />
                      <small className="text-muted">Visit our <a href="/about" className="text-decoration-none">About page</a> for more info</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-dark w-100" onClick={() => setShowHelp(false)}>
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
