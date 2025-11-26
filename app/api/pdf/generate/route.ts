import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/src/types/recipes.types';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';

function generateHTML(recipes: Recipe[], title: string): string {
  const recipesHTML = recipes
    .map(
      (recipe) => `
    <div class="recipe-page">
      <!-- Header Section -->
      <div class="page-header">
        <div class="title-section">
          <h1 class="recipe-title">${recipe.title}</h1>
          <p class="inspired-by">Inspired by: <strong>Idris Cooks</strong></p>
        </div>
        <div class="header-ingredients">
          ${recipe.tags && recipe.tags.length > 0 ? recipe.tags.slice(0, 4).map(tag => `<div class="header-ingredient">${tag}</div>`).join('') : '<div class="header-ingredient">Gourmet Recipe</div>'}
        </div>
      </div>

      <!-- Info Bar -->
      <div class="info-bar">
        <div class="info-item">
          <span class="info-label">Recipe by:</span>
          <span class="info-value">Idris Cooks</span>
        </div>
        <div class="info-item">
          <span class="info-label">Serves</span>
          <span class="info-value">${recipe.servings}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Prep Time</span>
          <span class="info-value">${recipe.prepTime} minutes</span>
        </div>
        <div class="info-item">
          <span class="info-label">Cook Time</span>
          <span class="info-value">${recipe.cookTime} minutes</span>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="two-column">
        <!-- Left Column: Ingredients -->
        <div class="left-column">
          <div class="ingredients-section">
            <h3 class="section-header highlight-header">Ingredients</h3>
            ${
              recipe.ingredients && recipe.ingredients.length > 0
                ? `
              <div class="ingredients-list">
                ${recipe.ingredients
                  .map(
                    (ing) => `
                  <div class="ingredient-item">
                    <span class="quantity">${ing.quantity}</span>
                    <span class="unit">${ing.unit}</span>
                    <span class="name">${ing.name}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
                : '<p class="no-data">No ingredients listed</p>'
            }
          </div>

          <div class="tools-section">
            <h3 class="section-header">Tools</h3>
            <ul class="tools-list">
              <li>Chef's knife</li>
              <li>Cutting board</li>
              <li>Large skillet</li>
              <li>Mixing bowls</li>
            </ul>
          </div>
        </div>

        <!-- Right Column: Photo & Instructions -->
        <div class="right-column">
          <!-- Recipe Photo -->
          <div class="recipe-photo" style="background-image: url('${recipe.imageUrl || ''}')">
            <div class="photo-overlay"></div>
          </div>

          <!-- Description -->
          ${
            recipe.description
              ? `
          <div class="recipe-description">
            <p>${recipe.description}</p>
          </div>
          `
              : ''
          }

          <!-- Instructions -->
          ${
            recipe.steps && recipe.steps.length > 0
              ? `
          <div class="instructions-section">
            <h3 class="section-header highlight-header">Instructions</h3>
            <div class="instructions-list">
              ${recipe.steps
                .map(
                  (step, stepIndex) => `
                <div class="instruction-step">
                  <div class="step-number">${stepIndex + 1}</div>
                  <p class="step-text">${step}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
          `
              : ''
          }
        </div>
      </div>

      <!-- Footer -->
      <div class="page-footer">
        <p>Idris Cooks' Recipe Collection</p>
      </div>
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        /* Import fonts - Serif for headings, Sans for body */
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: white;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
        }

        /* Recipe Page */
        .recipe-page {
          page-break-after: always;
          padding: 50px;
          background: white;
        }

        /* Header Section */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
        }

        .title-section {
          flex: 1;
        }

        .recipe-title {
          font-family: 'Merriweather', serif;
          font-size: 56px;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 10px;
          color: #000;
        }

        .inspired-by {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .header-ingredients {
          text-align: right;
          min-width: 250px;
        }

        .header-ingredient {
          font-size: 14px;
          line-height: 1.8;
          color: #333;
        }

        /* Info Bar */
        .info-bar {
          display: flex;
          gap: 30px;
          padding: 15px 0;
          margin-bottom: 30px;
          border-bottom: 1px solid #ddd;
        }

        .info-item {
          display: flex;
          gap: 8px;
        }

        .info-label {
          font-size: 13px;
          color: #666;
        }

        .info-value {
          font-size: 13px;
          font-weight: 600;
          color: #000;
        }

        /* Two Column Layout */
        .two-column {
          display: grid;
          grid-template-columns: 40% 60%;
          gap: 40px;
          margin-bottom: 30px;
        }

        /* Left Column */
        .left-column {
          padding-right: 20px;
        }

        .section-header {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #000;
        }

        .highlight-header {
          background: #FFC107;
          padding: 8px 12px;
          display: inline-block;
          margin-bottom: 15px;
        }

        .ingredients-list {
          margin-bottom: 30px;
        }

        .ingredient-item {
          display: flex;
          gap: 6px;
          padding: 6px 0;
          font-size: 14px;
          border-bottom: 1px solid #eee;
        }

        .quantity {
          font-weight: 600;
          min-width: 35px;
        }

        .unit {
          color: #666;
          min-width: 50px;
        }

        .name {
          flex: 1;
        }

        .tools-section {
          margin-top: 30px;
        }

        .tools-list {
          list-style: none;
          padding: 0;
        }

        .tools-list li {
          padding: 5px 0;
          font-size: 14px;
          color: #333;
        }

        /* Right Column */
        .right-column {
          padding-left: 20px;
        }

        .recipe-photo {
          width: 100%;
          height: 400px;
          background-size: cover;
          background-position: center;
          border-radius: 8px;
          margin-bottom: 20px;
          position: relative;
        }

        .photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
          border-radius: 8px;
        }

        .recipe-description {
          margin-bottom: 25px;
          line-height: 1.8;
        }

        .recipe-description p {
          font-size: 15px;
          color: #333;
        }

        /* Instructions */
        .instructions-list {
          margin-top: 20px;
        }

        .instruction-step {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .step-number {
          background: #000;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .step-text {
          flex: 1;
          font-size: 14px;
          line-height: 1.7;
          color: #333;
          margin: 0;
          padding-top: 6px;
        }

        /* Page Footer */
        .page-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #999;
        }

        /* Collection Header & Footer */
        .header {
          background: white;
          padding: 40px 50px;
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #000;
        }

        .header-content {
          position: relative;
        }

        .main-title {
          font-family: 'Merriweather', serif;
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #000;
        }

        .subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 10px;
        }

        .recipe-count {
          display: inline-block;
          background: #FFC107;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 15px;
          color: #000;
        }

        .content {
          padding: 0;
        }

        .footer {
          background: white;
          padding: 30px 50px;
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 40px;
          border-top: 3px solid #000;
        }

        .footer-brand {
          color: #F20094;
          font-weight: 700;
          text-decoration: none;
        }

        .generation-info {
          margin-top: 10px;
          font-size: 12px;
          color: #999;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .recipe-page {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <h1 class="main-title">${title}</h1>
            <p class="subtitle">A Collection of Culinary Delights</p>
            <div class="recipe-count">
              ${recipes.length} Recipe${recipes.length !== 1 ? 's' : ''} Included
            </div>
          </div>
        </div>

        <div class="content">
          ${recipesHTML}
        </div>

        <div class="footer">
          <div>
            Crafted with passion by <a href="https://www.idriscooks.com" class="footer-brand">Idris Cooks</a>
          </div>
          <div class="generation-info">
            Generated on ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} • Premium Recipe Collection
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { recipes, title = 'My Favorite Recipes' }: { recipes: Recipe[]; title?: string } =
      await request.json();

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return NextResponse.json({ error: 'No recipes provided' }, { status: 400 });
    }

    // Generate HTML content
    const htmlContent = generateHTML(recipes, title);

    // For now, always return HTML for client-side PDF generation
    // TODO: Add server-side PDF generation with Puppeteer if needed
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
