import React, { useState, useEffect } from 'react';
import './NotificationBadge.css';

interface NotificationBadgeProps {
  count: number;
}

function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;
  
  const displayCount = count > 99 ? '99+' : count;
  
  return (
    <span className="notification-badge">{displayCount}</span>
  );
}

export default NotificationBadge;

