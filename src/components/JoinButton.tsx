import { Game } from '../data';
import { C } from '../theme';
import { Chunky } from './Chunky';
import { Txt } from './Txt';

export function JoinButton({ g, joined, onJoin, onLeave }: { g: Game; joined: boolean; onJoin: (id: string) => void; onLeave: (id: string) => void }) {
  return (
    <Chunky
      depth={3}
      radius={10}
      height={36}
      bg={joined ? C.ink : C.white}
      onPress={() => (joined ? onLeave(g.id) : onJoin(g.id))}
      faceStyle={{ paddingHorizontal: 14 }}
    >
      <Txt w={800} size={14} color={joined ? C.g : C.ink}>
        {joined ? 'In ✓' : 'Join'}
      </Txt>
    </Chunky>
  );
}
