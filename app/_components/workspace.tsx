"use client";

const HTML5_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title></title>
</head>
<body>
  <p>Hello World</p>
</body>
</html>`;

import { useDeferredValue, useState } from "react";
import CodeEditor from "./code-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSearchParams } from "next/navigation";

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    },
  );
}

function generateUrl(params: Record<string, string>) {
  const baseUrl = window.location.origin;
  const queryParams = new URLSearchParams({
    code: params.code.replaceAll("\n", "\\n"),
    hideActionbar: params.hideActionbar,
    direction: params.direction,
    swapLayout: params.swapLayout,
    fontSize: params.fontSize,
    zoom: params.zoom,
    showLineNumber: params.showLineNumber,
    enableMiniMap: params.enableMiniMap,
    isShowMacButtons: params.isShowMacButtons,
  });
  return `${baseUrl}?${queryParams.toString()}`;
}

function Circle({ color, radius }: { color: string; radius: number }) {
  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle r={radius} cx={radius} cy={radius} fill={color} />
    </svg>
  );
}

export default function Workspace() {
  const params = useSearchParams();
  const defaultCode = params.get("code")?.replaceAll("\\n", "\n");
  const defaultDirection =
    params.get("direction") === "vertical" ? "vertical" : "horizontal";
  const defaultSwapLayout = params.get("swapLayout") === "true" ? true : false;
  const defaultFontSize = Number.parseInt(params.get("fontSize") ?? "16");
  const defaultShowLineNumber =
    params.get("showLineNumber") === "false" ? false : true;
  const defaultZoom = Number.parseFloat(params.get("zoom") ?? "1.0");
  const defaultEnableMiniMap =
    params.get("enableMiniMap") === "false" ? false : true;
  const isHideActionbar = params.get("hideActionbar") === "true";
  const defaultIsShowMacButtons =
    params.get("isShowMacButtons") === "true" ? true : false;
  const [code, setCode] = useState(defaultCode ?? HTML5_TEMPLATE);
  const [zoom, setZoom] = useState(defaultZoom);
  const [isShowMacButtons, setIsShowMacButtons] = useState(
    defaultIsShowMacButtons,
  );
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [enableMiniMap, setEnableMiniMap] = useState(defaultEnableMiniMap);
  const [showLineNumber, setShowLineNumber] = useState(defaultShowLineNumber);
  const deferredCode = useDeferredValue(code);
  const [direction, setDirection] = useState<"vertical" | "horizontal">(
    defaultDirection,
  );
  const [swapLayout, setSwapLayout] = useState<boolean>(defaultSwapLayout);

  function copyLink(hideActionbar: boolean = false) {
    const url = generateUrl({
      code,
      hideActionbar: `${hideActionbar}`,
      direction,
      swapLayout: `${swapLayout}`,
      fontSize: `${fontSize}`,
      zoom: `${zoom}`,
      showLineNumber: `${showLineNumber}`,
      enableMiniMap: `${enableMiniMap}`,
      isShowMacButtons: `${isShowMacButtons}`,
    });
    if (url.length >= 2000) {
      alert("程式碼過長無法複製 qwq");
      return;
    }
    copyTextToClipboard(url);
    alert("複製成功");
  }

  return (
    <div
      className={`w-full h-screen overflow-hidden bg-[#2e3440] p-3 flex flex-col ${isShowMacButtons ? "gap-2" : "gap-3"}`}
    >
      {isShowMacButtons && (
        <div className="flex items-center">
          <div className="flex p-2 gap-2">
            <Circle color="#FF5F56" radius={7} />
            <Circle color="#FFBD2D" radius={7} />
            <Circle color="#26C940" radius={7} />
          </div>
          <div className="flex-1 text-center text-white">code.html</div>
          <div className="flex p-2 gap-2">
            <Circle color="transparent" radius={7} />
            <Circle color="transparent" radius={7} />
            <Circle color="transparent" radius={7} />
          </div>
        </div>
      )}
      {!isHideActionbar && (
        <div className="flex bg-transparent gap-3 rounded-md items-center">
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => copyLink()}
          >
            複製連結
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => copyLink(true)}
          >
            複製隱藏 Actionbar 的連結
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => setFontSize((pre) => pre + 1)}
          >
            編輯器字體增大 {fontSize}
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => setFontSize((pre) => pre - 1)}
          >
            編輯器字體縮小 {fontSize}
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => setZoom((pre) => pre + 0.1)}
          >
            預覽放大 {zoom.toFixed(1)}
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => setZoom((pre) => pre - 0.1)}
          >
            預覽縮小 {zoom.toFixed(1)}
          </button>
          <label className="flex gap-1 items-center text-white select-none">
            <input
              type="checkbox"
              checked={direction === "vertical"}
              onChange={(e) => {
                setDirection(e.target.checked ? "vertical" : "horizontal");
              }}
            />
            縱向佈局
          </label>
          <label className="flex gap-1 items-center text-white select-none">
            <input
              type="checkbox"
              checked={showLineNumber}
              onChange={(e) => {
                setShowLineNumber(e.target.checked);
              }}
            />
            顯示行號
          </label>
          <label className="flex gap-1 items-center text-white select-none">
            <input
              type="checkbox"
              checked={enableMiniMap}
              onChange={(e) => {
                setEnableMiniMap(e.target.checked);
              }}
            />
            啟用迷你地圖
          </label>
          <label className="flex gap-1 items-center text-white select-none">
            <input
              type="checkbox"
              checked={isShowMacButtons}
              onChange={(e) => {
                setIsShowMacButtons(e.target.checked);
              }}
            />
            顯示神奇按鈕
          </label>
          <label className="gap-1 items-center hidden">
            <input
              type="checkbox"
              checked={swapLayout}
              onChange={(e) => {
                setSwapLayout(e.target.checked);
              }}
            />
            交錯佈局
          </label>
        </div>
      )}
      <ResizablePanelGroup
        direction={direction}
        className={`h-full w-full ${isHideActionbar ? "gap-1" : "gap-2"}`}
      >
        <ResizablePanel>
          <div className="w-full h-full rounded-md overflow-hidden text-white">
            <CodeEditor
              enableMiniMap={enableMiniMap}
              showLineNumber={showLineNumber}
              fontSize={fontSize}
              value={deferredCode}
              onChange={(e) => {
                setCode(e ?? "");
              }}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle={true}
          className={`text-[#4c566a] bg-slate-500 rounded-md ${isHideActionbar && "opacity-0"}`}
          color="#1111111"
        />
        <ResizablePanel>
          <div className="w-full h-full rounded-md overflow-y-scroll overflow-x-hidden">
            <iframe
              className="w-full h-full origin-top-left border-none bg-white"
              style={{
                transform: `scale(${zoom})`,
              }}
              src={`data:text/html;charset=utf-8,${encodeURIComponent(code)}`}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
