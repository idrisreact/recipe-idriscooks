import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/src/types/recipes.types';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';

function generateHTML(recipes: Recipe[], title: string): string {
  const recipesHTML = recipes
    .map(
      (recipe, index) => `
    <div class="recipe-card" style="
      background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 48px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(218, 165, 32, 0.1);
      page-break-inside: avoid;
      position: relative;
      overflow: hidden;
    ">
      <!-- Decorative accent -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #DAA520 0%, #B8860B 50%, #CD853F 100%);
      "></div>
      
      <!-- Recipe Header -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h2 style="
            color: #2C1810;
            font-family: 'Georgia', serif;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            line-height: 1.2;
            letter-spacing: -0.5px;
          ">${recipe.title}</h2>
          <div style="
            background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(218, 165, 32, 0.3);
          ">Recipe #${index + 1}</div>
        </div>
        ${
          recipe.description
            ? `
          <p style="
            color: #6B5B73;
            font-size: 16px;
            line-height: 1.6;
            margin: 0;
            font-style: italic;
            padding-left: 4px;
            border-left: 3px solid #DAA520;
            padding-left: 16px;
            margin-left: 4px;
          ">${recipe.description}</p>
        `
            : ''
        }
      </div>

      <!-- Recipe Metrics -->
      <div style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 32px;
        padding: 20px;
        background: rgba(218, 165, 32, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(218, 165, 32, 0.1);
      ">
        <div style="text-align: center;">
          <div style="
            color: #DAA520;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
            font-family: 'Georgia', serif;
          ">${recipe.prepTime}</div>
          <div style="
            color: #8B7355;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">PREP TIME (MIN)</div>
        </div>
        <div style="text-align: center;">
          <div style="
            color: #B8860B;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
            font-family: 'Georgia', serif;
          ">${recipe.cookTime}</div>
          <div style="
            color: #8B7355;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">COOK TIME (MIN)</div>
        </div>
        <div style="text-align: center;">
          <div style="
            color: #CD853F;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
            font-family: 'Georgia', serif;
          ">${recipe.servings}</div>
          <div style="
            color: #8B7355;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">SERVINGS</div>
        </div>
      </div>

      <!-- Content Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
        
        <!-- Ingredients Section -->
        ${
          recipe.ingredients && recipe.ingredients.length > 0
            ? `
          <div>
            <div style="
              display: flex;
              align-items: center;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 2px solid #DAA520;
            ">
              <h3 style="
                color: #2C1810;
                font-family: 'Georgia', serif;
                font-size: 20px;
                font-weight: 600;
                margin: 0;
                letter-spacing: -0.3px;
              ">Ingredients</h3>
            </div>
            <div style="
              background: rgba(218, 165, 32, 0.02);
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #DAA520;
            ">
              ${recipe.ingredients
                .map(
                  (ing) => `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 8px 0;
                  border-bottom: 1px solid rgba(218, 165, 32, 0.1);
                  margin-bottom: 8px;
                ">
                  <span style="
                    color: #2C1810;
                    font-size: 15px;
                    font-weight: 500;
                  ">${ing.name}</span>
                  <span style="
                    color: #8B7355;
                    font-size: 14px;
                    font-weight: 600;
                    background: rgba(218, 165, 32, 0.1);
                    padding: 4px 8px;
                    border-radius: 6px;
                  ">${ing.quantity} ${ing.unit}</span>
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
          <div>
            <div style="
              display: flex;
              align-items: center;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 2px solid #B8860B;
            ">
              <h3 style="
                color: #2C1810;
                font-family: 'Georgia', serif;
                font-size: 20px;
                font-weight: 600;
                margin: 0;
                letter-spacing: -0.3px;
              ">Instructions</h3>
            </div>
            <div style="
              background: rgba(184, 134, 11, 0.02);
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #B8860B;
            ">
              ${recipe.steps
                .map(
                  (step, stepIndex) => `
                <div style="
                  display: flex;
                  gap: 16px;
                  margin-bottom: 16px;
                  padding-bottom: 16px;
                  border-bottom: ${stepIndex < recipe.steps.length - 1 ? '1px solid rgba(184, 134, 11, 0.1)' : 'none'};
                ">
                  <div style="
                    background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%);
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    flex-shrink: 0;
                    margin-top: 2px;
                  ">${stepIndex + 1}</div>
                  <p style="
                    color: #2C1810;
                    font-size: 15px;
                    line-height: 1.6;
                    margin: 0;
                    font-weight: 400;
                  ">${step}</p>
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

      <!-- Tags Section -->
      ${
        recipe.tags && recipe.tags.length > 0
          ? `
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(218, 165, 32, 0.2);">
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <span style="
              color: #8B7355;
              font-size: 14px;
              font-weight: 600;
              margin-right: 8px;
            ">TAGS:</span>
            ${recipe.tags
              .map(
                (tag) => `
              <span style="
                background: linear-gradient(135deg, #CD853F 0%, #DAA520 100%);
                color: white;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 4px rgba(205, 133, 63, 0.3);
              ">${tag}</span>
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
        /* Import elegant fonts */
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.7;
          color: #2C1810;
          background: linear-gradient(135deg, #fefefe 0%, #f8f6f3 100%);
          margin: 0;
          padding: 40px;
          min-height: 100vh;
        }
        
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid rgba(218, 165, 32, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #2C1810 0%, #4A3728 100%);
          padding: 48px 40px;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(218,165,32,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(184,134,11,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(205,133,63,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
          opacity: 0.3;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .main-title {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 42px;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: -1px;
          line-height: 1.1;
        }
        
        .subtitle {
          font-size: 18px;
          opacity: 0.9;
          font-weight: 300;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        
        .recipe-count {
          display: inline-flex;
          align-items: center;
          background: rgba(218, 165, 32, 0.2);
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 500;
          margin-top: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(218, 165, 32, 0.3);
        }
        
        .content {
          padding: 48px 40px;
        }
        
        .footer {
          background: linear-gradient(135deg, #f8f6f3 0%, #f0ebe5 100%);
          padding: 32px 40px;
          text-align: center;
          border-top: 1px solid rgba(218, 165, 32, 0.1);
          color: #8B7355;
          font-size: 16px;
          font-weight: 400;
        }
        
        .footer-brand {
          color: #DAA520;
          font-weight: 600;
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
            background: white;
          }
          .container {
            box-shadow: none;
            border: none;
          }
          .recipe-card { 
            page-break-inside: avoid;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: #2C1810;
          }
          .header::before {
            display: none;
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
