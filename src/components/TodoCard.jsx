import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Flag,
} from 'lucide-react';
import {
  format,
  formatDistanceToNowStrict,
  isPast,
  differenceInHours,
  differenceInDays,
  differenceInMinutes,
} from 'date-fns';
import './TodoCard.css';

/**
 * Formats the due date display string.
 * e.g. "Due Feb 18, 2026"
 */
function formatDueDate(date) {
  return `Due ${format(date, 'MMM d, yyyy')}`;
}

/**
 * Formats the time remaining in a human-friendly way.
 * Accounts for overdue, soon, and normal cases.
 */
function formatTimeRemaining(dueDate) {
  const now = new Date();
  const overdue = isPast(dueDate);

  if (overdue) {
    const hoursAgo = differenceInHours(now, dueDate);
    const minutesAgo = differenceInMinutes(now, dueDate);
    const daysAgo = differenceInDays(now, dueDate);

    if (minutesAgo < 60) {
      return {
        text: `Overdue by ${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''}`,
        status: 'overdue',
      };
    }
    if (hoursAgo < 24) {
      return {
        text: `Overdue by ${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''}`,
        status: 'overdue',
      };
    }
    return {
      text: `Overdue by ${daysAgo} day${daysAgo !== 1 ? 's' : ''}`,
      status: 'overdue',
    };
  }

  const minutesLeft = differenceInMinutes(dueDate, now);
  const hoursLeft = differenceInHours(dueDate, now);
  const daysLeft = differenceInDays(dueDate, now);

  if (minutesLeft < 60) {
    return {
      text: `Due in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`,
      status: 'soon',
    };
  }
  if (hoursLeft < 24) {
    return {
      text: `Due in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`,
      status: 'soon',
    };
  }
  if (daysLeft <= 3) {
    return {
      text: `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
      status: 'soon',
    };
  }

  return {
    text: `Due in ${formatDistanceToNowStrict(dueDate)}`,
    status: 'normal',
  };
}

/**
 * Determine card status based on completion and due date.
 */
function resolveStatus(baseStatus, isCompleted, dueDate) {
  if (isCompleted) return 'Completed';
  if (isPast(dueDate)) return 'Overdue';
  return baseStatus;
}

function getStatusClass(status) {
  const map = {
    'Pending': 'pending',
    'In Progress': 'in-progress',
    'Completed': 'completed',
    'Overdue': 'overdue',
  };
  return map[status] || 'pending';
}

export default function TodoCard({ todo }) {
  const {
    title,
    description,
    priority,
    dueDate: dueDateStr,
    status: baseStatus,
    tags,
  } = todo;

  const dueDate = new Date(dueDateStr);
  const [isCompleted, setIsCompleted] = useState(baseStatus === 'Completed');
  const [timeInfo, setTimeInfo] = useState(() => formatTimeRemaining(dueDate));
  const [dueDateDisplay, setDueDateDisplay] = useState(() => formatDueDate(dueDate));

  const updateTime = useCallback(() => {
    setTimeInfo(formatTimeRemaining(dueDate));
    setDueDateDisplay(formatDueDate(dueDate));
  }, [dueDate]);

  // Update time remaining every 30 seconds
  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [updateTime]);

  const currentStatus = resolveStatus(baseStatus, isCompleted, dueDate);
  const statusClass = getStatusClass(currentStatus);

  const handleToggle = () => {
    setIsCompleted((prev) => !prev);
  };

  const timeRemainingClass = [
    'todo-card__meta-item',
    'todo-card__time-remaining',
    timeInfo.status === 'overdue' && 'todo-card__time-remaining--overdue',
    timeInfo.status === 'soon' && 'todo-card__time-remaining--soon',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={`todo-card${isCompleted ? ' completed' : ''}`}
      data-testid="test-todo-card"
    >
      {/* Header: Checkbox + Title + Priority */}
      <header className="todo-card__header">
        <div className="todo-card__checkbox-wrapper">
          <input
            type="checkbox"
            className="todo-card__checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            aria-label={`Mark "${title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
            data-testid="test-todo-complete-toggle"
            id="todo-checkbox"
          />
          <label htmlFor="todo-checkbox" className="visually-hidden">
            Toggle completion
          </label>
        </div>

        <div className="todo-card__content">
          <div className="todo-card__title-row">
            <h2 className="todo-card__title" data-testid="test-todo-title">
              {title}
            </h2>
            <span
              className={`todo-card__priority todo-card__priority--${priority.toLowerCase()}`}
              data-testid="test-todo-priority"
              aria-label={`Priority: ${priority}`}
            >
              <Flag size={10} />
              {priority}
            </span>
          </div>

          <p className="todo-card__description" data-testid="test-todo-description">
            {description}
          </p>
        </div>
      </header>

      {/* Meta: Due Date, Time Remaining, Status */}
      <div className="todo-card__meta">
        <time
          className="todo-card__meta-item todo-card__due-date"
          dateTime={dueDate.toISOString()}
          data-testid="test-todo-due-date"
        >
          <Calendar size={14} />
          {dueDateDisplay}
        </time>

        <time
          className={timeRemainingClass}
          dateTime={dueDate.toISOString()}
          data-testid="test-todo-time-remaining"
        >
          <Clock size={14} />
          {timeInfo.text}
        </time>

        <span
          className={`todo-card__status todo-card__status--${statusClass}`}
          data-testid="test-todo-status"
          aria-label={`Status: ${currentStatus}`}
        >
          <span className="todo-card__status-dot" aria-hidden="true" />
          {currentStatus}
        </span>
      </div>

      {/* Tags */}
      <ul
        className="todo-card__tags"
        role="list"
        data-testid="test-todo-tags"
      >
        {tags.map((tag) => (
          <li
            key={tag}
            className="todo-card__tag"
            data-testid={`test-todo-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {tag}
          </li>
        ))}
      </ul>

      {/* Divider */}
      <hr className="todo-card__divider" aria-hidden="true" />

      {/* Actions */}
      <div className="todo-card__actions">
        <button
          className="todo-card__action-btn todo-card__action-btn--edit"
          aria-label="Edit task"
          data-testid="test-todo-edit-button"
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          className="todo-card__action-btn todo-card__action-btn--delete"
          aria-label="Delete task"
          data-testid="test-todo-delete-button"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </article>
  );
}
