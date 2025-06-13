// Utility functions for diagram operations

/**
 * Creates a template for an empty diagram
 */
export const createEmptyDiagram = (): string => {
  return `<mxfile host="embed.diagrams.net" modified="2023-01-01T00:00:00.000Z" agent="Mozilla/5.0" etag="1" version="1" type="embed"><diagram id="blank" name="Page-1">7VtNc5swEP01PnYGEHbcY+yk7aGdyYwPbY8yyFgTjDxCxHZ/fSUjMEjEJnEwuFNfLFbSSnr7dlcS9OB4vvnC0CL6TkOc9IAVbnrwpgfAwHLFrzRsM4MPQWaYMRJmJrsATMgrVkBLQVMSYl4pyClNOFlUwYDGMQ54BYYYo+tqtylNqndduAm2wVxgEiS4Af1FQh5lUB/4Bf6GyCzK72z3h9k/c5RXVuPkEQrpugSCtxaPZlY/5mmCGYlQTOfCr1sJ/obZLOJTIcZDMQpwShi+imgqHwKNxDScymdGF4LYPijH8Yz0Xbkj0R9vyjcjwjgW/RLvRPFU9Fn8jXG0DZ9FMWJ0GYfK7LLVdQTfR/XxvCwfXkb3MzD5Z/3zZHtBg8/kQj3uMw2JGAO0FWAcSdW6tNzkz7YuGpZFRcdEmjRhAUEkYXmBEQUojFg+ePT6e8J+TOnDwrXvweP0cfr3Tlm1xGzeiK7nOKFMoCmNYEiXGIf4OmU4jcMTLdjriHB8v0CB/HetkVSbcD4XMlvSCfFZHLHjnMTBTCJ2XC39E0440cYEKUMT8YA0b8oJi8XHPWpKYnMOGHCGnzFjQhkCtBSv4K1S7Vp5rOQCZGGacVwygCMc3mIFJJbJ1eTZnYTcB41ELhPTWOjiXiuHQcaTRrb6zCTfZL5F1pmg4olAMwLQzkZGaDcLQUdqW9JLpXa5GgYoGgcBiQrJCbEMBRIZ8jUO1I5Ug7pTdqRFQxKLuZ6FabRMwrNY6jCxnNHOZvLZ0KnCTBP5hcNaKscdHqgdt66g/VZQ/yhQH0oK+0dA2iB9B51S2K9RuNEy7R6F7YMo7B0FaaAx7nSksKOjcB0NboTCvTZZUFrZhzKLr9GgPQrDWpw7CoU9I4WHTaS1S2E4aJPCfXA2FLY1yAxbpXC/ZsS98MwoPNDWnp+PhH3W+ZzULYkXiIXPcyq86Neyp2tYQ/fAYdjaXiA4m71ADQMOC3JLCA6My97NLHRe0K9JrdsltXVotliE/tmszvuBMxN12/Uj59ZCOi1vwtoZ5KCl0k1Uu4Vuq+e2PeHOKQ6Nn8LcWqD7rTY6HUC30QKCzohb36h1DF2v1QanA+ga1bPdZHaM3EGrLU4HyDWauXaTKW4xGcGz+iKulhAiShYveBtdkOfjPWxdFq3VxX5Li+5BnfFGKUw5XYoPu2TKCzgvyxQfnrkb1ffUB++njWaod0JO22in8G2M0+zSJuL85EoeLo3JL4niJYi5iMwJ+cLpXLzKZyEjwQI31uE30dLQ0bTcGTUTGW7gRmZsbeG0Tn42OjMWktkSswUSPxoJMCfMYAzDGtm5RhrKT0jU3kN5+Q0hxYMTXYQUOtXVPzQS0q1fWM2o7hDSNyymR1KvDL0J4mxzAqwbTH8gxDQJt4SbDmOFZDgFGU57Z1TT4Pf3OM5FXDXSUqPdbXR0jQYEelzvyHVG29Sx7jZ6ukaLCQyz7Wx3G31do8WseZFGG4pmH8Ol9cp+kAhv/wM=</diagram></mxfile>`;
};

/**
 * Base64 decodes a string
 */
export const decodeBase64 = (data: string): string => {
  try {
    // Check if the string is base64 encoded
    if (/^[A-Za-z0-9+/=]+$/.test(data)) {
      return atob(data);
    }
    return data;
  } catch (error) {
    console.error("Error decoding base64:", error);
    return data;
  }
};

// Define interfaces for DrawIO event data
interface DrawioEventBase {
  event?: string;
  xml?: string;
  data?: string | Record<string, unknown>;
}

/**
 * Attempts to extract XML content from various formats
 */
export const extractXmlContent = (event: DrawioEventBase): string | null => {
  console.log("Extracting XML content from event", event);

  try {
    // Case 1: Direct XML content in the event
    if (event.xml) {
      console.log("XML content found directly in event.xml");

      // Check if it's an SVG data URL with base64 encoding
      if (
        typeof event.xml === "string" &&
        event.xml.startsWith("data:image/svg+xml;base64,")
      ) {
        console.log("Detected base64 encoded SVG data URL");
        const base64Data = event.xml.replace("data:image/svg+xml;base64,", "");
        const decodedSvg = decodeBase64(base64Data);
        console.log(`Decoded SVG length: ${decodedSvg.length}`);

        // Look for embedded XML within SVG
        const mxGraphModelMatch = decodedSvg.match(
          /<mxGraphModel[^>]*>[\s\S]*?<\/mxGraphModel>/
        );
        if (mxGraphModelMatch) {
          console.log("Found mxGraphModel content within SVG");
          return `<mxfile>${mxGraphModelMatch[0]}</mxfile>`;
        }

        // Check for mxfile content
        const mxFileMatch = decodedSvg.match(/<mxfile[^>]*>[\s\S]*?<\/mxfile>/);
        if (mxFileMatch) {
          console.log("Found mxfile content within SVG");
          return mxFileMatch[0];
        }

        console.log("No diagram content found in SVG, returning null");
        return null;
      }

      return event.xml;
    }

    // Case 2: Check if event.data is SVG content containing XML
    if (event.data) {
      console.log("Checking event.data for XML content");

      let content: string;
      if (typeof event.data === "string") {
        content = event.data;
      } else if (typeof event.data === "object" && event.data.toString) {
        content = event.data.toString();
      } else {
        console.log(
          "event.data is not a string or cannot be converted to string"
        );
        return null;
      }

      // Look for mxGraphModel content
      const mxGraphModelMatch = content.match(
        /<mxGraphModel[^>]*>[\s\S]*?<\/mxGraphModel>/
      );
      if (mxGraphModelMatch) {
        console.log("Found mxGraphModel content in event.data");
        return `<mxfile>${mxGraphModelMatch[0]}</mxfile>`;
      }

      // Look for mxfile content
      const mxFileMatch = content.match(/<mxfile[^>]*>[\s\S]*?<\/mxfile>/);
      if (mxFileMatch) {
        console.log("Found mxfile content in event.data");
        return mxFileMatch[0];
      }
    }

    console.log("No XML content could be extracted");
    return null;
  } catch (error) {
    console.error("Error extracting XML content:", error);
    return null;
  }
};
