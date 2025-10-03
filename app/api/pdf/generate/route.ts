import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/src/types/recipes.types';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';

function generateHTML(recipes: Recipe[], title: string): string {
  const recipesHTML = recipes
    .map(
      (recipe) => `
    <div class="recipe-card">
      <!-- Recipe Image Header -->
      <div class="recipe-image-header" style="background-image: url('${recipe.imageUrl || ''}')">
        <div class="image-overlay"></div>
        <div class="image-content">
          <h2 class="recipe-title">${recipe.title}</h2>
          <div class="recipe-meta-badges">
            <div class="meta-badge">
              <span class="badge-label">Main dish</span>
            </div>
            <div class="meta-badge">
              <span class="badge-label">${recipe.cookTime + recipe.prepTime} min</span>
            </div>
            <div class="meta-badge">
              <span class="badge-label">Serves ${recipe.servings}</span>
            </div>
          </div>
          ${recipe.description ? `<p class="recipe-description">${recipe.description}</p>` : ''}
        </div>
      </div>

      <!-- Tags Section -->
      ${
        recipe.tags && recipe.tags.length > 0
          ? `
        <div class="tags-section">
          ${recipe.tags
            .map(
              (tag) => `
            <span class="tag">${tag}</span>
          `
            )
            .join('')}
          <span class="tag comfort-tag">#comfort-food</span>
        </div>
      `
          : ''
      }

      <!-- Recipe Metrics -->
      <div class="recipe-metrics">
        <div class="metric">
          <div class="metric-label">Prep</div>
          <div class="metric-value">${recipe.prepTime} min</div>
        </div>
        <div class="metric">
          <div class="metric-label">Cook</div>
          <div class="metric-value">${recipe.cookTime} min</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total</div>
          <div class="metric-value">${recipe.prepTime + recipe.cookTime} min</div>
        </div>
      </div>

      <!-- Ingredients Section -->
      ${
        recipe.ingredients && recipe.ingredients.length > 0
          ? `
        <div class="ingredients-section">
          <h3 class="section-title">Ingredients</h3>
          <div class="ingredients-grid">
            ${recipe.ingredients
              .map(
                (ing) => `
              <div class="ingredient-badge">
                ${ing.quantity} ${ing.unit} ${ing.name}
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <!-- Instructions Section -->
      ${
        recipe.steps && recipe.steps.length > 0
          ? `
        <div class="instructions-section">
          <h3 class="section-title">Step-by-step preparation</h3>
          <div class="instructions-grid">
            ${recipe.steps
              .map(
                (step, stepIndex) => `
              <div class="instruction-card">
                <div class="step-header">Step ${stepIndex + 1}</div>
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
        /* Import modern fonts */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #e5e7eb;
          background: #1a1a1a;
          margin: 0;
          padding: 40px;
          min-height: 100vh;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: #1a1a1a;
        }

        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          padding: 60px 50px;
          text-align: center;
          color: white;
          position: relative;
          margin-bottom: 60px;
          border-radius: 12px;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .main-title {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 20px;
          letter-spacing: -1px;
          line-height: 1.1;
        }

        .subtitle {
          font-size: 18px;
          opacity: 0.8;
          font-weight: 400;
          margin-bottom: 12px;
        }

        .recipe-count {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          margin-top: 24px;
        }

        .content {
          padding: 0;
        }

        /* Recipe Card Styles */
        .recipe-card {
          background: #1a1a1a;
          border-radius: 12px;
          margin-bottom: 60px;
          page-break-inside: avoid;
          page-break-after: auto;
          break-inside: avoid;
          overflow: hidden;
        }

        /* Recipe Image Header */
        .recipe-image-header {
          position: relative;
          height: 400px;
          background-size: cover;
          background-position: center;
          border-radius: 12px 12px 0 0;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
        }

        .image-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 40px;
          color: white;
        }

        .recipe-title {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 16px;
          color: white;
          line-height: 1.1;
        }

        .recipe-meta-badges {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .meta-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .badge-label {
          font-size: 14px;
          font-weight: 500;
          color: white;
        }

        .recipe-description {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        /* Tags Section */
        .tags-section {
          padding: 24px 40px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          background: #1a1a1a;
        }

        .tag {
          background: #db2777;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .comfort-tag {
          background: #db2777;
        }

        /* Metrics */
        .recipe-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          margin: 0 40px 40px 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
        }

        .metric {
          padding: 24px;
          text-align: center;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric:last-child {
          border-right: none;
        }

        .metric-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: white;
        }

        /* Section Title */
        .section-title {
          color: white;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 24px;
          padding: 0 40px;
        }

        /* Ingredients */
        .ingredients-section {
          margin-bottom: 40px;
        }

        .ingredients-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 0 40px;
        }

        .ingredient-badge {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
          padding: 16px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Instructions */
        .instructions-section {
          margin-bottom: 40px;
        }

        .instructions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 0 40px 40px 40px;
        }

        .instruction-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
        }

        .step-header {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }

        .step-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        /* Footer */
        .footer {
          background: rgba(255, 255, 255, 0.05);
          padding: 40px 50px;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
          margin-top: 60px;
          border-radius: 12px;
        }

        .footer-brand {
          color: #db2777;
          font-weight: 700;
          text-decoration: none;
        }

        .generation-info {
          margin-top: 12px;
          font-size: 14px;
          opacity: 0.8;
        }

        @media print {
          body {
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
          }
          .recipe-card {
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
