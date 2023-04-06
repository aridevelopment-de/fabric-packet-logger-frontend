import styles from "./styles.module.css"
import { IBasePacket } from "../../types"
import { useEffect, useRef } from "react";
import { Text } from "@mantine/core"


interface MapUpdateData {
	mapId: number;
	scale: number;
	isLocked: boolean;
	icons: Array<Object>;
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

const MapUpdateS2CAdapter = (props: {data: IBasePacket['data']['data']}) => {
  const packetData = props.data as MapUpdateData;

  if (packetData.updateData.data === undefined) {
    return <Text color="dimmed">No map data available.</Text>
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
    })();
	};

	return (
		<div className={styles.canvas__wrapper}>
			<Canvas draw={draw} width={127} height={127}></Canvas>
		</div>
	);
}

export default MapUpdateS2CAdapter;