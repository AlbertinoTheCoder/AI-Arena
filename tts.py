import asyncio
import json
import sys
import subprocess

import edge_tts
import imageio_ffmpeg


def tighten_audio(audio):
    processed = subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error',
        '-i', 'pipe:0', '-af',
        'silenceremove=start_periods=1:start_duration=0.03:start_threshold=-45dB:start_silence=0.03:stop_periods=-1:stop_duration=0.16:stop_threshold=-45dB:stop_silence=0.05',
        '-codec:a', 'libmp3lame', '-b:a', '64k', '-f', 'mp3', 'pipe:1',
    ], input=bytes(audio), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
       timeout=15, creationflags=subprocess.CREATE_NO_WINDOW)
    if processed.returncode != 0:
        raise RuntimeError('Could not tighten speech pauses: ' + processed.stderr.decode('utf-8', errors='replace'))
    return processed.stdout


async def main():
    request = json.loads(sys.stdin.buffer.read(100000).decode('utf-8'))
    communicate = edge_tts.Communicate(request['text'], request['voice'])
    audio = bytearray()
    async with asyncio.timeout(45):
        async for chunk in communicate.stream():
            if chunk['type'] == 'audio':
                audio.extend(chunk['data'])
    if request.get('tightPauses', True):
        audio = tighten_audio(audio)
    sys.stdout.buffer.write(audio)
    sys.stdout.buffer.flush()


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
