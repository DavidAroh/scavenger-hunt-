import { Shell } from "@/components/Shell";
import { RecoverForm } from "@/components/RecoverForm";
import { Stagger, Item } from "@/components/Reveal";
import { isStorageReady } from "@/lib/store";

export default function RecoverPage() {
  if (!isStorageReady) return <Shell><p className="label text-coral">Hunt not open</p><h1 className="display mt-3">Recovery is unavailable.</h1><p className="mt-4 text-fog-200">Persistent event storage has not been configured.</p></Shell>;
  return (
    <Shell>
      <Stagger>
        <Item as="p" className="label text-sky font-mono">
          <span className="text-green">$</span> ./resume
        </Item>
        <Item as="span">
          <h1 className="display mt-3">Lost your place?</h1>
        </Item>
        <Item as="p" className="mt-4 mb-8 text-fog-200 font-light">
          New phone or cleared browser? Enter the email or number you registered with and pick up where you left off.
        </Item>
        <Item>
          <RecoverForm />
        </Item>
      </Stagger>
    </Shell>
  );
}
