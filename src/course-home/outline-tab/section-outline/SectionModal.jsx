import React from 'react';
import { Modal } from '@openedx/paragon';

const SectionModal = ({
  open,
  onClose,
  title,
  blurb,
  bannerUrl,
  items = [],
  footerText,
  onPrev,
  onNext,
}) => {
  return (
    <Modal isOpen={open} onClose={onClose} id="section-modal" size="lg" isFullscreenOnMobile>
      <Modal.Header onClose={onClose} className="p-0">
        <div className="ch-banner-wrap w-100">
          {bannerUrl ? (
            <div className="ch-banner-img" style={{ backgroundImage: `url(${bannerUrl})` }} />
          ) : (
            <div className="ch-banner-fallback" />
          )}
          <div className="ch-banner-title">
            <h4 className="mb-0">{title}</h4>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {blurb ? <p className="mb-4">{blurb}</p> : null}

        <div className="d-flex flex-column gap-3">
          {items.map(({ id, node }) => (
            <div key={id} className="ch-item-row">
              {node}
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <div className="text-muted small">{footerText}</div>
        <div className="d-flex gap-2">
          {onPrev ? (
            <button type="button" className="btn btn-outline-secondary" onClick={onPrev}>
              Previous
            </button>
          ) : null}
          {onNext ? (
            <button type="button" className="btn btn-primary" onClick={onNext}>
              Next section →
            </button>
          ) : null}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SectionModal;
