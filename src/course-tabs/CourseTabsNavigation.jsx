import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { useCoursewareSearchState } from '../course-home/courseware-search/hooks';

const CourseTabsNavigation = ({ activeTabSlug, className, tabs }) => {
  const intl = useIntl();
  const { show } = useCoursewareSearchState();

  return (
    <div
      id="courseTabsNavigation"
      className={classNames('course-tabs-navigation', className, { 'has-search-open': show })}
      data-testid="course-tabs-navigation"
    >
      <div className="container-xl">
        <nav
          className="nav-underline-tabs tabs-no-overflow"
          role="tablist"
          aria-label={intl.formatMessage(messages.courseMaterial)}
        >
          {tabs.map(({ url, title, slug }) => (
            <a
              key={slug}
              href={url}
              className={classNames('tab-link', { active: slug === activeTabSlug })}
              data-tab={slug}
            >
              <span className="label">{title}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

CourseTabsNavigation.propTypes = {
  activeTabSlug: PropTypes.string,
  className: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    title: PropTypes.node.isRequired,
    slug: PropTypes.string.isRequired,
  })).isRequired,
};

export default CourseTabsNavigation;
