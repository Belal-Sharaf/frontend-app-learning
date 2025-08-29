import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import messages from './messages';
import Tabs from '../generic/tabs/Tabs';
import { CoursewareSearch, CoursewareSearchToggle } from '../course-home/courseware-search';
import { useCoursewareSearchState } from '../course-home/courseware-search/hooks';

const CourseTabsNavigation = ({
  activeTabSlug, className, tabs,
}) => {
  const intl = useIntl();
  const { show } = useCoursewareSearchState();

  return (
    <div
      id="courseTabsNavigation"
      className={classNames('course-tabs-navigation course-tabs', className)}
    >
      <div className="container-xl">
        <div className="nav-bar d-flex align-items-center justify-content-between">
          <div className="nav-menu">
            {/* Use nav + nav-tabs to match our SCSS selectors */}
            <Tabs
              className="nav nav-tabs"
              aria-label={intl.formatMessage(messages.courseMaterial)}
            >
              {tabs.map(({ url, title, slug }) => (
                <a
                  key={slug}
                  href={url}
                  className={classNames(
                    'nav-link',
                    { active: slug === activeTabSlug },
                  )}
                >
                  {title}
                </a>
              ))}
            </Tabs>
          </div>

          <div className="search-toggle ms-3">
            <CoursewareSearchToggle />
          </div>
        </div>
      </div>

      {show && <CoursewareSearch />}
    </div>
  );
};

CourseTabsNavigation.propTypes = {
  activeTabSlug: PropTypes.string,
  className: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
};

CourseTabsNavigation.defaultProps = {
  activeTabSlug: undefined,
  className: null,
};

export default CourseTabsNavigation;
