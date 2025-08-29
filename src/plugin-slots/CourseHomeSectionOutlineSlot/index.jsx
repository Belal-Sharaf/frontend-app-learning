import React, { useMemo, useState } from 'react';
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

  const getMeta = (seqIds) => `Pages: ${seqIds.length}`;

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
                onOpen={() => setOpenSectionId(id)}
              />
            </li>
          );
        })}
      </ol>

      {openSectionId ? (() => {
        const s = sections[openSectionId];
        const items = s.sequenceIds.map((seqId) => ({
          id: seqId,
          node: <SequenceLink key={seqId} id={seqId} sequence={sequences[seqId]} first={false} />,
        }));

        return (
          <SectionModal
            open
            onClose={() => setOpenSectionId(null)}
            title={s.title}
            items={items}
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
