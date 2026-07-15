import React from 'react'

export default function CategoryNavbar() {
  const categories = [
    { name: 'All Rooms', icon: 'fa-hotel' },
    { name: 'Deluxe', icon: 'fa-star' },
    { name: 'Standard', icon: 'fa-bed' },
    { name: 'Premium', icon: 'fa-diamond' },
    { name: 'Economy', icon: 'fa-tag' },
    { name: 'Penthouse', icon: 'fa-building' },
  ]

  return (
    <div className="category-navbar bg-white py-3 shadow-sm sticky-top" style={{ top: '72px', zIndex: 900 }}>
      <div className="container">
        <div className="d-flex justify-content-center align-items-center overflow-auto py-1">
          {categories.map((cat, index) => (
            <button 
              key={index} 
              className={`category-item btn border-0 px-4 d-flex flex-column align-items-center ${index === 0 ? 'active' : ''}`}
              style={{ minWidth: '100px' }}
            >
              <i className={`fa ${cat.icon} mb-2 h4`}></i>
              <span className="small fw-bold">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
