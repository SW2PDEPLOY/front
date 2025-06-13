import { Route, Routes as RouterRoutes, Navigate, useNavigate } from 'react-router-dom';
import { AuthPage } from '../components/AuthPage';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { DiagramsPage, NewDiagramPage, TodoPage, NewMockupPage, MobileAppsPage, MobileAppFromImagePage } from '../pages';
import { MobileAppFromPromptPage } from '../pages/MobileAppFromPromptPage';
import { useCallback } from 'react';
import { authApi } from '../services/apiService';
import { DiagramListPage } from '../pages/DiagramListPage';

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authApi.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const Routes = () => {
  const navigate = useNavigate();
  
  // Navigation callbacks using useNavigate
  const handleAuthSuccess = useCallback(() => {
    navigate('/');
  }, [navigate]);
  
  const handleCreateNew = useCallback(() => {
    navigate('/new-diagram');
  }, [navigate]);
  
  const handleCreateNewMockup = useCallback(() => {
    navigate('/new-mockup');
  }, [navigate]);
  
  const handleOpenExisting = useCallback(() => {
    navigate('/diagrams-list');
  }, [navigate]);
  
  const handleShowTodoApp = useCallback(() => {
    navigate('/todos');
  }, [navigate]);
  
  const handleLogout = useCallback(() => {
    authApi.logout();
    navigate('/login');
  }, [navigate]);
  
  return (
    <RouterRoutes>
      {/* Public routes */}
      <Route path="/login" element={<AuthPage onSuccess={handleAuthSuccess} />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <WelcomeScreen 
            onCreateNew={handleCreateNew} 
            onCreateNewMockup={handleCreateNewMockup}
            onOpenExisting={handleOpenExisting} 
            onShowTodoApp={handleShowTodoApp} 
            onFileImport={(e) => console.log('File import', e)} 
            onLogout={handleLogout} 
          />
        </ProtectedRoute>
      } />
      
      <Route path="/todos" element={
        <ProtectedRoute>
          <TodoPage />
        </ProtectedRoute>
      } />
      
      <Route path="/diagrams" element={
        <ProtectedRoute>
          <DiagramsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/diagrams-list" element={
        <ProtectedRoute>
          <DiagramListPage />
        </ProtectedRoute>
      } />
      
      <Route path="/new-diagram" element={
        <ProtectedRoute>
          <NewDiagramPage />
        </ProtectedRoute>
      } />
      
      <Route path="/new-mockup" element={
        <ProtectedRoute>
          <NewMockupPage />
        </ProtectedRoute>
      } />
      
      <Route path="/mobile-app-from-prompt" element={
        <ProtectedRoute>
          <MobileAppFromPromptPage />
        </ProtectedRoute>
      } />
      
      <Route path="/mobile-apps" element={
        <ProtectedRoute>
          <MobileAppsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/mobile-app-from-image" element={
        <ProtectedRoute>
          <MobileAppFromImagePage />
        </ProtectedRoute>
      } />
      
      {/* Nueva ruta para editar diagramas */}
      <Route path="/edit/:type/:id" element={
        <ProtectedRoute>
          <DiagramsPage />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
}; 