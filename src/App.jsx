import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import MainLayout from '@/layouts/MainLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const AllRecipesPage = lazy(() => import('@/pages/AllRecipesPage'));
const RecipeDetailPage = lazy(() => import('@/pages/RecipeDetailPage'));
const RecipeCreatePage = lazy(() => import('@/pages/RecipeCreatePage'));
const RecipeEditPage = lazy(() => import('@/pages/RecipeEditPage'));
const MealPlannerPage = lazy(() => import('@/pages/MealPlannerPage'));
const ShoppingListPage = lazy(() => import('@/pages/ShoppingListPage'));
const SuggestionsPage = lazy(() => import('@/pages/SuggestionsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="recipes/browse" element={<AllRecipesPage />} />
        <Route path="recipes/new" element={<RecipeCreatePage />} />
        <Route path="recipes/:id" element={<RecipeDetailPage />} />
        <Route path="recipes/:id/edit" element={<RecipeEditPage />} />
        <Route path="planner" element={<MealPlannerPage />} />
        <Route path="shop" element={<ShoppingListPage />} />
        <Route path="suggest" element={<SuggestionsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
