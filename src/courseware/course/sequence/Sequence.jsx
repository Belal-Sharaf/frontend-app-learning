/* eslint-disable @typescript-eslint/no-use-before-define */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  sendTrackEvent,
  sendTrackingLogEvent,
} from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import SequenceExamWrapper from '@edx/frontend-lib-special-exams';

import PageLoading from '@src/generic/PageLoading';
import { useModel } from '@src/generic/model-store';
import { useSequenceBannerTextAlert, useSequenceEntranceExamAlert } from '@src/alerts/sequence-alerts/hooks';
import SequenceContainerSlot from '@src/plugin-slots/SequenceContainerSlot';
import { CourseOutlineSidebarSlot } from '@src/plugin-slots/CourseOutlineSidebarSlot';
import { CourseOutlineSidebarTriggerSlot } from '@src/plugin-slots/CourseOutlineSidebarTriggerSlot';
import { NotificationsDiscussionsSidebarSlot } from '@src/plugin-slots/NotificationsDiscussionsSidebarSlot';
import SequenceNavigationSlot from '@src/plugin-slots/SequenceNavigationSlot';

import { getCoursewareOutlineSidebarSettings } from '../../data/selectors';
import CourseLicense from '../course-license';
import messages from './messages';
import HiddenAfterDue from './hidden-after-due';
import { UnitNavigation } from './sequence-navigation';
import SequenceContent from './SequenceContent';

const Sequence = ({
  unitId,
  sequenceId,
  courseId,
  unitNavigationHandler,
  nextSequenceHandler,
  previousSequenceHandler,
}) => {
  const intl = useIntl();
  const {
    canAccessProctoredExams,
    license,
  } = useModel('coursewareMeta', courseId);
  const {
    isStaff,
    originalUserIsStaff,
  } = useModel('courseHomeMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);
  const unit = useModel('units', unitId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  const sequenceMightBeUnit = useSelector(state => state.courseware.sequenceMightBeUnit);
  const { enableNavigationSidebar: isEnabledOutlineSidebar } = useSelector(getCoursewareOutlineSidebarSettings);

  const handleNext = () => {
    const nextIndex = sequence.unitIds.indexOf(unitId) + 1;
    const newUnitId = sequence.unitIds[nextIndex];
    handleNavigate(newUnitId);

    if (nextIndex >= sequence.unitIds.length) {
      nextSequenceHandler();
    }
  };

  const handlePrevious = () => {
    const previousIndex = sequence.unitIds.indexOf(unitId) - 1;
    const newUnitId = sequence.unitIds[previousIndex];
    handleNavigate(newUnitId);

    if (previousIndex < 0) {
      previousSequenceHandler();
    }
  };

  const handleNavigate = (destinationUnitId) => {
    unitNavigationHandler(destinationUnitId);
  };

  const logEvent = (eventName, widgetPlacement, targetUnitId) => {
    // Note: tabs are tracked with a 1-indexed position
    // as opposed to a 0-index used throughout this MFE
    const currentIndex = sequence.unitIds.length > 0 ? sequence.unitIds.indexOf(unitId) : 0;
    const payload = {
      current_tab: currentIndex + 1,
      id: unitId,
      tab_count: sequence.unitIds.length,
      widget_placement: widgetPlacement,
    };
    if (targetUnitId) {
      const targetIndex = sequence.unitIds.indexOf(targetUnitId);
      payload.target_tab = targetIndex + 1;
    }
    sendTrackEvent(eventName, payload);
    sendTrackingLogEvent(eventName, payload);
  };

  useSequenceBannerTextAlert(sequenceId);
  useSequenceEntranceExamAlert(courseId, sequenceId, intl);

  useEffect(() => {
    function receiveMessage(event) {
      const { type } = event.data;
      if (type === 'entranceExam.passed') {
        // Reload to pick up blocks that were hidden before the exam was passed.
        global.location.reload();
      }
    }
    global.addEventListener('message', receiveMessage);
  }, []);

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };

  useEffect(() => {
    if (unit) {
      setUnitHasLoaded(false);
    }
  }, [(unit || {}).id]);

  const loading = sequenceStatus === 'loading' || (sequenceStatus === 'failed' && sequenceMightBeUnit);
  if (loading) {
    if (!sequenceId) {
      return (<div> {intl.formatMessage(messages.noContent)} </div>);
    }
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages.loadingSequence)}
      />
    );
  }

  if (sequenceStatus === 'loaded' && sequence.isHiddenAfterDue) {
    return <HiddenAfterDue courseId={courseId} />;
  }

  const gated = sequence && sequence.gatedContent !== undefined && sequence.gatedContent.gated;

  // Header title + progress (safe fallbacks for different backends)
  const headerTitle = (unit && (unit.displayName || unit.title || unit.name))
    || (sequence && (sequence.displayName || sequence.title || sequence.name))
    || (section && (section.displayName || section.title || section.name))
    || '';
  const unitIndex = (sequence && sequence.unitIds) ? sequence.unitIds.indexOf(unitId) : -1;
  const activeIndex = unitIndex >= 0 ? unitIndex : 0;
  const totalUnits = (sequence && sequence.unitIds) ? sequence.unitIds.length : 0;
  const progressPct = totalUnits ? Math.min(100, Math.max(0, Math.round(((activeIndex + 1) / totalUnits) * 100))) : 0;

  // Minimal, reliable header buttons that always call your handlers
  const HeaderNavButton = ({ dir, onClick }) => (
    <button
      type="button"
      className={`cw-nav-btn ${dir === 'prev' ? 'prev' : 'next'}`}
      aria-label={dir === 'prev' ? 'Previous unit' : 'Next unit'}
      onClick={onClick}
    >
      {dir === 'prev' ? '‹' : '›'}
    </button>
  );
  HeaderNavButton.propTypes = {
    dir: PropTypes.oneOf(['prev', 'next']).isRequired,
    onClick: PropTypes.func.isRequired,
  };

  const renderUnitNavigation = (isAtTop) => (
    <UnitNavigation
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      isAtTop={isAtTop}
      onClickPrevious={() => {
        logEvent('edx.ui.lms.sequence.previous_selected', isAtTop ? 'top' : 'bottom');
        handlePrevious();
      }}
      onClickNext={() => {
        logEvent('edx.ui.lms.sequence.next_selected', isAtTop ? 'top' : 'bottom');
        handleNext();
      }}
    />
  );

  const defaultContent = (
    <>
      <div className="sequence-container d-inline-flex flex-row w-100">
        <CourseOutlineSidebarTriggerSlot
          sectionId={section ? section.id : null}
          sequenceId={sequenceId}
          isStaff={isStaff}
          unitId={unitId}
        />
        <CourseOutlineSidebarSlot />
        <div className="sequence w-100">
          {!isEnabledOutlineSidebar && (
            <div className="sequence-navigation-container">
              <SequenceNavigationSlot
                sequenceId={sequenceId}
                unitId={unitId}
                nextHandler={() => {
                  logEvent('edx.ui.lms.sequence.next_selected', 'top');
                  handleNext();
                }}
                onNavigate={(destinationUnitId) => {
                  logEvent('edx.ui.lms.sequence.tab_selected', 'top', destinationUnitId);
                  handleNavigate(destinationUnitId);
                }}
                previousHandler={() => {
                  logEvent('edx.ui.lms.sequence.previous_selected', 'top');
                  handlePrevious();
                }}
                {...{
                  nextSequenceHandler,
                  handleNavigate,
                }}
              />
            </div>
          )}

          {/* === Sticky unit header (title + prev/next + slim progress) === */}
          <div className="cw-unit-header" role="region" aria-label="Unit navigation">
            <div className="cw-unit-header__left">
              {headerTitle ? <h1 className="cw-unit-title">{headerTitle}</h1> : null}
            </div>
            <div className="cw-unit-header__right">
              {isEnabledOutlineSidebar && (
                <>
                  <HeaderNavButton
                    dir="prev"
                    onClick={() => {
                      logEvent('edx.ui.lms.sequence.previous_selected', 'top');
                      handlePrevious();
                    }}
                  />
                  <HeaderNavButton
                    dir="next"
                    onClick={() => {
                      logEvent('edx.ui.lms.sequence.next_selected', 'top');
                      handleNext();
                    }}
                  />
                </>
              )}
            </div>
            <div className="cw-progress" aria-hidden="true">
              <div className="cw-progress__bar" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="unit-container flex-grow-1 pt-4">
            <SequenceContent
              courseId={courseId}
              gated={gated}
              sequenceId={sequenceId}
              unitId={unitId}
              unitLoadedHandler={handleUnitLoaded}
              isOriginalUserStaff={originalUserIsStaff}
              isEnabledOutlineSidebar={isEnabledOutlineSidebar}
              renderUnitNavigation={renderUnitNavigation}
            />
            {unitHasLoaded && renderUnitNavigation(false)}
          </div>
        </div>
        <NotificationsDiscussionsSidebarSlot courseId={courseId} />
      </div>
      <SequenceContainerSlot courseId={courseId} unitId={unitId} />
    </>
  );

  if (sequenceStatus === 'loaded') {
    return (
      <>
        <div className="d-flex flex-column flex-grow-1 justify-content-center">
          <SequenceExamWrapper
            sequence={sequence}
            courseId={courseId}
            isStaff={isStaff}
            originalUserIsStaff={originalUserIsStaff}
            canAccessProctoredExams={canAccessProctoredExams}
          >
            {defaultContent}
          </SequenceExamWrapper>
        </div>
        <CourseLicense license={license || undefined} />
      </>
    );
  }

  // sequence status 'failed' and any other unexpected sequence status.
  return (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {intl.formatMessage(messages.loadFailure)}
    </p>
  );
};

Sequence.propTypes = {
  unitId: PropTypes.string,
  sequenceId: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
};

Sequence.defaultProps = {
  sequenceId: null,
  unitId: null,
};

export default Sequence;
