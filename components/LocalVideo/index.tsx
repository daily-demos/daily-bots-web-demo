import { useEffect, useRef } from "react";
import { FunctionCallParams, LLMHelper } from "realtime-ai";
import { useVoiceClient, useVoiceClientMediaTrack } from "realtime-ai-react";

export default function LocalVideo() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoTrack = useVoiceClientMediaTrack("video", "local");
  const voiceClient = useVoiceClient()!;
  //
  // ---- LLMFunctionCall event: use to take UI action when our get_image
  //      function is executed on the bot. We don't need to send any
  //      return frame, because everything on the bot side is handled by
  //      the bot.
  //
  //       - We could play a shutter sound and show a flash to indicate image
  //         capture.
  //       - We could also check to make sure the camera is on and if not
  //         could send back a function call result saying "IMAGE IS NOT
  //         AVAILABLE BECAUSE CAMERA IS OFF". The LLM will then say something
  //         relevant and the conversation history will reflect reality.
  //
  // KHK NOTE: The LLMFunctionCall callback isn't executing.
  //
  //         I must be getting something very simple wrong. The app
  //         message is arriving. If I change the event type
  //         to VoiceEvent.Metrics I see the console log printing out.
  //
  //         Here is a captured app message:
  //
  // {
  //   "msgStr": "sig-msg",
  //   "tag": "x-egassem",
  //   "from": "ac95f499-71f9-4451-b7a5-3799a05b7652",
  //   "to": "*",
  //   "msgData": {
  //     "data": {
  //       "args": {
  //         "text_context": "Does the person in the video have glasses on?"
  //       },
  //       "function_name": "get_image",
  //       "tool_call_id": "toolu_01DsK2hayDPuPy6JAyTFeVaz"
  //     },
  //     "label": "rtvi-ai",
  //     "type": "llm-function-call"
  //   },
  //   "serverTS": 1723956970762
  // }

  (voiceClient.getHelper("llm") as LLMHelper).handleFunctionCall(
    async (fn: FunctionCallParams) => {
      console.log("Function call", fn);
      var audio = new Audio("shutter.mp3");
      audio.play();
    }
  );

  //

  useEffect(() => {
    if (!localVideoRef.current || !localVideoTrack) return;
    if (localVideoRef.current.srcObject) {
      const oldTrack = (
        localVideoRef.current.srcObject as MediaStream
      ).getVideoTracks()[0];
      if (oldTrack.id === localVideoTrack.id) return;
    }
    localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
  }, [localVideoTrack]);

  return (
    <div style={{ transform: "scaleX(-1)" }}>
      <video autoPlay playsInline ref={localVideoRef} />
    </div>
  );
}
