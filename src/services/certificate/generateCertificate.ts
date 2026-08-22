import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { connectDB } from '@/lib/db/mongoose';
import { Scorecard, IScorecard } from '@/models/Scorecard';
import { evaluateModuleEligibility, ModuleEligibility } from '@/services/eligibility/badgeEngine';

interface CertificateData {
  projectName: string;
  founderEmail: string;
  modules: ModuleEligibility[];
  scorecard: IScorecard | null;
  earnedBadgeCount: number;
  generatedAt: Date;
}

/**
 * Gathers all data needed to render a certificate.
 */
async function getCertificateData(
  projectName: string,
  founderEmail: string
): Promise<CertificateData> {
  await connectDB();

  const modules = await evaluateModuleEligibility(projectName);
  const scorecard = await Scorecard.findOne({ projectName });
  const earnedBadgeCount = modules.filter((m) => m.badgeEarned).length;

  return {
    projectName,
    founderEmail,
    modules,
    scorecard,
    earnedBadgeCount,
    generatedAt: new Date(),
  };
}

/**
 * Creates the certificate React element tree for satori to render.
 */
function createCertificateElement(data: CertificateData) {
  const {
    projectName,
    earnedBadgeCount,
    scorecard,
    generatedAt,
  } = data;

  const earnedModules = data.modules.filter((m) => m.badgeEarned);

  return {
    type: 'div' as const,
    props: {
      style: {
        width: '1200px',
        height: '800px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0A0C 0%, #1a1a2e 50%, #0A0A0C 100%)',
        color: '#FAFAFA',
        fontFamily: 'Inter',
        padding: '60px',
      },
      children: [
        {
          type: 'div' as const,
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              border: '2px solid rgba(255,255,255,0.16)',
              borderRadius: '24px',
              padding: '48px 64px',
              width: '100%',
              height: '100%',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'div' as const,
                props: {
                  style: { fontSize: '16px', color: '#A1A1AA', letterSpacing: '4px', textTransform: 'uppercase' as const },
                  children: 'Builder Growth Incubator',
                },
              },
              {
                type: 'div' as const,
                props: {
                  style: { fontSize: '42px', fontWeight: 800, marginTop: '16px', background: 'linear-gradient(90deg, #C026D3, #A855F7)', backgroundClip: 'text', color: 'transparent' },
                  children: 'Certificate of Completion',
                },
              },
              {
                type: 'div' as const,
                props: {
                  style: { fontSize: '28px', fontWeight: 700, marginTop: '24px', color: '#FAFAFA' },
                  children: projectName,
                },
              },
              {
                type: 'div' as const,
                props: {
                  style: { fontSize: '16px', color: '#A1A1AA', marginTop: '12px' },
                  children: `${earnedBadgeCount} of 6 module badges earned`,
                },
              },
              scorecard ? {
                type: 'div' as const,
                props: {
                  style: {
                    display: 'flex',
                    gap: '24px',
                    marginTop: '32px',
                    flexWrap: 'wrap' as const,
                    justifyContent: 'center',
                  },
                  children: [
                    { type: 'div' as const, props: { style: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }, children: [{ type: 'div' as const, props: { style: { fontSize: '24px', fontWeight: 700, color: '#3B82F6' }, children: String(scorecard.okrAchievementScore) } }, { type: 'div' as const, props: { style: { fontSize: '11px', color: '#71717A', marginTop: '4px' }, children: 'OKR' } }] } },
                    { type: 'div' as const, props: { style: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }, children: [{ type: 'div' as const, props: { style: { fontSize: '24px', fontWeight: 700, color: '#3B82F6' }, children: String(scorecard.pcfProgressionScore) } }, { type: 'div' as const, props: { style: { fontSize: '11px', color: '#71717A', marginTop: '4px' }, children: 'PCF' } }] } },
                    { type: 'div' as const, props: { style: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }, children: [{ type: 'div' as const, props: { style: { fontSize: '24px', fontWeight: 700, color: '#3B82F6' }, children: String(scorecard.executionSystemsScore) } }, { type: 'div' as const, props: { style: { fontSize: '11px', color: '#71717A', marginTop: '4px' }, children: 'Execution' } }] } },
                    { type: 'div' as const, props: { style: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }, children: [{ type: 'div' as const, props: { style: { fontSize: '24px', fontWeight: 700, color: '#3B82F6' }, children: String(scorecard.learningReflectionScore) } }, { type: 'div' as const, props: { style: { fontSize: '11px', color: '#71717A', marginTop: '4px' }, children: 'Learning' } }] } },
                    { type: 'div' as const, props: { style: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }, children: [{ type: 'div' as const, props: { style: { fontSize: '24px', fontWeight: 700, color: '#3B82F6' }, children: String(scorecard.nextPhaseReadinessScore) } }, { type: 'div' as const, props: { style: { fontSize: '11px', color: '#71717A', marginTop: '4px' }, children: 'Readiness' } }] } },
                  ],
                },
              } : null,
              {
                type: 'div' as const,
                props: {
                  style: { fontSize: '12px', color: '#71717A', marginTop: '32px' },
                  children: `Avalanche Track • Generated ${generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };
}

/**
 * Generates a certificate as PNG or PDF.
 */
export async function generateCertificate(
  projectName: string,
  founderEmail: string,
  format: 'png' | 'pdf' = 'png'
): Promise<Buffer> {
  const data = await getCertificateData(projectName, founderEmail);
  const element = createCertificateElement(data);

  // Load font for satori
  let fontData: ArrayBuffer;
  try {
    const fontPath = join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf');
    const fontBuffer = await readFile(fontPath);
    fontData = fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength
    );
  } catch {
    // If font file is not available locally, fetch from a reliable CDN
    const fontResponse = await fetch(
      'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.20/files/inter-latin-700-normal.woff'
    );
    const fontArrayBuffer = await fontResponse.arrayBuffer();
    fontData = fontArrayBuffer;
  }

  // Render to SVG using satori
  const svg = await satori(element as React.ReactNode, {
    width: 1200,
    height: 800,
    fonts: [
      {
        name: 'Inter',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  if (format === 'png') {
    // Convert SVG to PNG using resvg
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    });
    const pngData = resvg.render();
    return Buffer.from(pngData.asPng());
  }

  // For PDF, return the SVG as a buffer (can be enhanced with a PDF library later)
  return Buffer.from(svg);
}
