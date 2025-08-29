import React from 'react';
import { Card } from '@openedx/paragon';

const SectionCard = ({ index, title, meta, onOpen, coverUrl }) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-100 text-start border-0 bg-transparent p-0"
      aria-label={`Open section ${index + 1}: ${title}`}
    >
      <Card className="ch-section-card">
        {coverUrl ? (
          <div className="ch-card-cover" style={{ backgroundImage: `url(${coverUrl})` }} />
        ) : null}

        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="small text-muted fw-semibold">{index + 1}</div>
        </Card.Header>

        <Card.Body>
          <div className="h6 mb-1">{title}</div>
          <div className="text-muted small">{meta}</div>
        </Card.Body>
      </Card>
    </button>
  );
};

export default SectionCard;
