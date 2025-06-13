import OpenAI from "openai";

interface OpenAIImageToMockupResponse {
  success: boolean;
  xmlContent?: string;
  error?: string;
}

/**
 * Converts an image to a mockup XML using OpenAI API
 */
export const convertImageToMockup = async (
  base64Image: string,
  apiKey: string
): Promise<OpenAIImageToMockupResponse> => {
  try {
    // Example XML for reference
    const referenceXml = `<mxfile host="embed.diagrams.net" agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 OPR/117.0.0.0" version="26.2.12">
  <diagram id="OIyeOLAm_IHcqsDtpEo0" name="Página-1">
    <mxGraphModel dx="962" dy="1606" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="QVYrSn8q1dpIXXexTUPX-1" value="" style="strokeWidth=1;shadow=0;dashed=0;align=center;shape=mxgraph.mockup.containers.browserWindow;rSize=0;strokeColor=#666666;strokeColor2=#008cff;strokeColor3=#c4c4c4;mainText=,;recursiveResize=0;" vertex="1" parent="1">
          <mxGeometry x="14" y="60" width="800" height="850" as="geometry" />
        </mxCell>
        <mxCell id="QVYrSn8q1dpIXXexTUPX-2" value="Page 1" style="strokeWidth=1;shadow=0;dashed=0;align=center;shape=mxgraph.mockup.containers.anchor;fontSize=17;fontColor=#666666;align=left;" vertex="1" parent="QVYrSn8q1dpIXXexTUPX-1">
          <mxGeometry x="60" y="12" width="110" height="26" as="geometry" />
        </mxCell>
        <mxCell id="QVYrSn8q1dpIXXexTUPX-3" value="https://www.draw.io" style="strokeWidth=1;shadow=0;dashed=0;align=center;shape=mxgraph.mockup.containers.anchor;rSize=0;fontSize=17;fontColor=#666666;align=left;" vertex="1" parent="QVYrSn8q1dpIXXexTUPX-1">
          <mxGeometry x="130" y="60" width="250" height="26" as="geometry" />
        </mxCell>
        <mxCell id="QVYrSn8q1dpIXXexTUPX-4" value="Nombre" style="shadow=0;dashed=0;shape=mxgraph.bootstrap.rrect;rSize=5;strokeColor=#CED4DA;strokeWidth=1;fillColor=#E9ECEF;fontColor=#505050;align=left;verticalAlign=middle;spacingLeft=10;fontSize=14;" vertex="1" parent="QVYrSn8q1dpIXXexTUPX-1">
          <mxGeometry x="30" y="200" width="740" height="40" as="geometry" />
        </mxCell>
        <mxCell id="QVYrSn8q1dpIXXexTUPX-5" value="Telefono" style="shadow=0;dashed=0;shape=mxgraph.bootstrap.rrect;rSize=5;strokeColor=#CED4DA;strokeWidth=1;fillColor=#E9ECEF;fontColor=#505050;align=left;verticalAlign=middle;spacingLeft=10;fontSize=14;" vertex="1" parent="QVYrSn8q1dpIXXexTUPX-1">
          <mxGeometry x="30" y="270" width="740" height="40" as="geometry" />
        </mxCell>
        <mxCell id="QVYrSn8q1dpIXXexTUPX-6" value="Direccion" style="shadow=0;dashed=0;shape=mxgraph.bootstrap.rrect;rSize=5;strokeColor=#CED4DA;strokeWidth=1;fillColor=#E9ECEF;fontColor=#505050;align=left;verticalAlign=middle;spacingLeft=10;fontSize=14;" vertex="1" parent="QVYrSn8q1dpIXXexTUPX-1">
          <mxGeometry x="30" y="340" width="740" height="40" as="geometry" />
        </mxCell>
        <mxCell id="QVYrSn8q1dpIXXexTUPX-7" value="Fecha Nacimiento" style="shadow=0;dashed=0;shape=mxgraph.bootstrap.rrect;rSize=5;strokeColor=#CED4DA;strokeWidth=1;fillColor=#E9ECEF;fontColor=#505050;align=left;verticalAlign=middle;spacingLeft=10;fontSize=14;" vertex="1" parent="QVYrSn8q1dpIXXexTUPX-1">
          <mxGeometry x="30" y="405" width="740" height="40" as="geometry" />
        </mxCell>
        <mxCell id="QVYrSn8q1dpIXXexTUPX-8" value="Enviar" style="rounded=1;fillColor=#0057D8;strokeColor=none;fontColor=#ffffff;align=center;verticalAlign=middle;fontStyle=0;fontSize=12;sketch=0;" vertex="1" parent="QVYrSn8q1dpIXXexTUPX-1">
          <mxGeometry x="357" y="470" width="86" height="33" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    // Prepare the prompt for OpenAI
    const prompt = `
Analyze this UI mockup image and convert it to a DrawIO XML diagram. 
Create form fields for all inputs, text areas, and buttons you see.
Use the mxGraph mockup components (like mxgraph.bootstrap.rrect for inputs).
Follow this reference XML structure but adapt it to match the mockup in the image:

${referenceXml}
`;

    // Initialize OpenAI client with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Make request to OpenAI API using the official SDK
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    // Extract the XML content from the response
    const responseContent = response.choices[0].message.content || "";

    // Look for XML content between tags or code blocks
    let xmlContent = responseContent;

    // Try to extract XML between ```xml and ``` tags
    const xmlMatch = responseContent.match(/```xml\s*([\s\S]*?)\s*```/);
    if (xmlMatch && xmlMatch[1]) {
      xmlContent = xmlMatch[1];
    } else {
      // Try to extract anything that looks like XML
      const xmlStart = responseContent.indexOf("<mxfile");
      const xmlEnd = responseContent.lastIndexOf("</mxfile>");

      if (xmlStart >= 0 && xmlEnd >= 0) {
        xmlContent = responseContent.substring(xmlStart, xmlEnd + 9);
      }
    }

    return {
      success: true,
      xmlContent,
    };
  } catch (error) {
    console.error("Error converting image to mockup:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};
