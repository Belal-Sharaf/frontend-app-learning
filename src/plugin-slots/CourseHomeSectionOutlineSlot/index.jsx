import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useModel } from '../../generic/model-store';
import { useContextId } from '../../data/hooks';

import SequenceLink from '../../course-home/outline-tab/section-outline/SequenceLink';
import SectionCard from '../../course-home/outline-tab/section-outline/SectionCard';
import SectionModal from '../../course-home/outline-tab/section-outline/SectionModal';

import '../../course-home/outline-tab/outline-cards.scss';

const CourseHomeSectionOutlineSlot = ({ sectionIds, sections }) => {
  const courseId = useContextId();
  const { courseBlocks: { sequences } } = useModel('outline', courseId);

  const [openSectionId, setOpenSectionId] = useState(null);
  const navigate = useNavigate();

  const getMeta = (seqIds) => `Pages: ${Array.isArray(seqIds) ? seqIds.length : 0}`;

  const idToIndex = useMemo(() => {
    const map = {};
    sectionIds.forEach((id, i) => { map[id] = i; });
    return map;
  }, [sectionIds]);

  const openIndex = openSectionId != null ? idToIndex[openSectionId] : -1;

  const handlePrev = () => {
    if (openIndex > 0) setOpenSectionId(sectionIds[openIndex - 1]);
  };
  const handleNext = () => {
    if (openIndex < sectionIds.length - 1) setOpenSectionId(sectionIds[openIndex + 1]);
  };

  const tryNavigateToFirstUnit = (section) => {
    const firstSeqId = section?.sequenceIds?.[0];
    const seq = firstSeqId ? sequences?.[firstSeqId] : null;

    // Best-effort: many MFEs expose either `href` (string) or a `to` (router object/string)
    const maybeTo = seq?.to || seq?.href;

    if (typeof maybeTo === 'string') {
      navigate(maybeTo);
      return true;
    }
    if (maybeTo && (maybeTo.pathname || maybeTo.search || maybeTo.hash)) {
      navigate(maybeTo);
      return true;
    }
    return false;
  };

  return (
    <>
      <ol className="ch-sections-grid">
        {sectionIds.map((id, idx) => {
          const s = sections[id];
          return (
            <li key={id}>
              <SectionCard
                index={idx}
                title={s.title}
                meta={getMeta(s.sequenceIds)}
                onOpen={() => {
                  // Primary behavior: go straight to first unit
                  const jumped = tryNavigateToFirstUnit(s);
                  if (!jumped) setOpenSectionId(id); // fallback: open modal
                }}
              />
            </li>
          );
        })}
      </ol>

      {openSectionId ? (() => {
        const s = sections[openSectionId];

        const safeSeqIds = (s?.sequenceIds || []).filter((seqId) => Boolean(sequences?.[seqId]));
        const hasAll = safeSeqIds.length === (s?.sequenceIds?.length || 0);

        const items = safeSeqIds.map((seqId) => ({
          id: seqId,
          node: (
            <SequenceLink
              key={seqId}
              id={seqId}
              sequence={sequences[seqId]}
              first={false}
            />
          ),
        }));

        return (
          <SectionModal
            open
            onClose={() => setOpenSectionId(null)}
            title={s?.title || 'Section'}
            items={items}
            blurb={!hasAll ? 'Loading section details…' : undefined}
            footerText={`Section ${openIndex + 1} of ${sectionIds.length}`}
            onPrev={openIndex > 0 ? handlePrev : undefined}
            onNext={openIndex < sectionIds.length - 1 ? handleNext : undefined}
          />
        );
      })() : null}
    </>
  );
};

export default CourseHomeSectionOutlineSlot;
