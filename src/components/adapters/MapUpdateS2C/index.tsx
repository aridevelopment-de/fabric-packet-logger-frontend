import styles from "./styles.module.css"
import { useEffect, useRef } from "react";
import { Text } from "@mantine/core"
import { ICON_COORDS_MAPPING, ICON_HEIGHT, ICON_WIDTH, Icons, MAP_URL } from './assetfetcher';


interface MapUpdateData {
	mapId: number;
	scale: number;
	isLocked: boolean;
	icons: Array<{
    type: number;
    x: number;
    z: number;
    rotation: number;
    hasDisplayName: boolean;
  }>;
	updateData: {
		x: number;
		z: number;
		columns: number;
		rows: number;
		data: Array<number>;
	};
}

const Canvas = (props: any) => {  
  const { draw, ...rest } = props
  const canvasRef = useCanvas(draw)
  return <canvas ref={canvasRef} {...rest}/>
}

const useCanvas = (draw: any) => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas: any = canvasRef.current
    const context = canvas.getContext('2d')
    
    const render = () => {
      draw(context, canvas);
    }

    render()
  }, [draw])
  
  return canvasRef
}

const MapUpdateS2CAdapter = (props: {data: {[key: string]: any} | null}) => {
  if (props.data === null) return null;

  const packetData = props.data as MapUpdateData;
  console.log(packetData);
  if (packetData.updateData === undefined || packetData.updateData.data === undefined) {
    return <Text color="dimmed">No map data available.</Text>
  }

  const drawIcon = (ctx: any, canvas: any, icon: MapUpdateData['icons'][0]) => {
    // @ts-ignore
    const [_rx, _ry] = ICON_COORDS_MAPPING[icon.type];
    const [textureOffX, textureOffY] = [_rx * ICON_WIDTH, _ry * ICON_WIDTH];

    const iconImage = new Image();
    iconImage.src = MAP_URL;

    // map x from -128, 127 to 0, 127
    const imX = (icon.x + 128) / 2 - ICON_WIDTH / 2;
    const imZ = (icon.z + 128) / 2 - ICON_HEIGHT / 2;

    iconImage.onload = () => {
      ctx.save();
      ctx.translate(imX, imZ);
      ctx.rotate(icon.rotation * 22.5);
      ctx.translate(-ICON_WIDTH / 2, -ICON_HEIGHT / 2);
      ctx.drawImage(iconImage, textureOffX, textureOffY, ICON_WIDTH, ICON_WIDTH, 0, 0, ICON_WIDTH, ICON_WIDTH);
      ctx.restore();
    }
  }

  const draw = (ctx: any, canvas: any) => {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

    (async () => {
      const colors = packetData.updateData.data;
      var colorArray = new Uint8ClampedArray(colors.length * 4);
  
      for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        const x = i % packetData.updateData.columns;
        const z = Math.floor(i / packetData.updateData.columns);
  
        const alpha = (c >> 24) & 0xff;
        const blue = (c >> 16) & 0xff;
        const green = (c >> 8) & 0xff;
        const red = c & 0xff;
  
        const pixelIndex = (z * packetData.updateData.columns + x) * 4;
        colorArray[pixelIndex] = red;
        colorArray[pixelIndex + 1] = green;
        colorArray[pixelIndex + 2] = blue;
        colorArray[pixelIndex + 3] = alpha;
      }
  
      const imageData = new ImageData(colorArray, packetData.updateData.columns, packetData.updateData.rows);
      ctx.putImageData(imageData, packetData.updateData.x, packetData.updateData.z);

      // now rendering of the icons
      packetData.icons.forEach((icon) => {
        drawIcon(ctx, canvas, icon);
      });
    })();
	};

	return (
		<div className={styles.canvas__wrapper}>
			<Canvas draw={draw} width={127} height={127}></Canvas>
		</div>
	);
}

export default MapUpdateS2CAdapter;