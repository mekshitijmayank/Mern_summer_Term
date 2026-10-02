import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items, defaultOpenId = null }) {
  const [openId, setOpenId] = useState(defaultOpenId);

  const toggleItem = (id) => {
    setOpenId((prevId) => (prevId === id ? null : id));
  };

  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
              boxShadow: isOpen ? '0 4px 20px rgba(0, 0, 0, 0.05)' : 'none'
            }}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                fontSize: '16px',
                fontWeight: 600,
                color: isOpen ? 'var(--primary)' : 'var(--text-dark)',
                gap: '16px',
                transition: 'color 0.2s ease'
              }}
            >
              <span>{item.question}</span>
              <ChevronDown
                size={20}
                style={{
                  flexShrink: 0,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: isOpen ? 'var(--primary)' : 'var(--text-muted)'
                }}
              />
            </button>

            <div
              id={`accordion-content-${item.id}`}
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                opacity: isOpen ? 1 : 0
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '0 24px 20px 24px',
                    color: 'var(--text-muted)',
                    fontSize: '15px',
                    lineHeight: '1.65'
                  }}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
