import React from 'react';
import ErrorPage from '../components/ErrorPage';

const NotFoundPage: React.FC = () => {
  return (
    <ErrorPage
      errorCode="404"
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showRetry={false}
      showGoHome={true}
      showGoBack={true}
    />
  );
};

export default NotFoundPage;