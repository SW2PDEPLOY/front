/**
 * Utilities for mockup diagrams
 */

/**
 * Creates a super simplified template for an empty mockup to avoid atob errors
 */
export const createEmptyMockup = (): string => {
  const currentDate = new Date().toISOString();
  const uniqueTag = `${Date.now()}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${currentDate}" agent="5.0" etag="${uniqueTag}" version="21.0.0" type="device">
  <diagram id="mockup-diagram" name="Mockup">
    <mxGraphModel grid="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}; 