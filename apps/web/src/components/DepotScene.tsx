import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { usePlannerStore } from "../store/plannerStore";

function VehicleMesh({
  x,
  z,
  electric,
}: {
  x: number;
  z: number;
  electric: boolean;
}) {
  return (
    <group position={[x, 0.45, z]}>
      <mesh castShadow>
        <boxGeometry args={[2.6, 0.9, 1.4]} />
        <meshStandardMaterial color={electric ? "#22c55e" : "#f59e0b"} />
      </mesh>

      {electric && (
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[0.5, 0.35, 0.8]} />
          <meshStandardMaterial color="#86efac" />
        </mesh>
      )}
    </group>
  );
}

function Charger({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x + 1.4, 0.65, z - 0.7]} castShadow>
      <boxGeometry args={[0.35, 1.3, 0.35]} />
      <meshStandardMaterial color="#60a5fa" />
    </mesh>
  );
}

function Depot() {
  const scenario = usePlannerStore((state) => state.scenario);
  const selectedYear = usePlannerStore((state) => state.selectedYear);

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[8, 12, 6]} intensity={2} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 18]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>

      <Grid
        args={[28, 18]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        sectionSize={4}
        fadeDistance={30}
      />

      {scenario.vehicles.map((vehicle) => {
        const electric =
          vehicle.transitionYear !== null &&
          vehicle.transitionYear <= selectedYear;

        return (
          <group key={vehicle.id}>
            <VehicleMesh
              x={vehicle.parkingPosition.x}
              z={vehicle.parkingPosition.z}
              electric={electric}
            />
            {electric && (
              <Charger
                x={vehicle.parkingPosition.x}
                z={vehicle.parkingPosition.z}
              />
            )}
          </group>
        );
      })}

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        minDistance={8}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

export function DepotScene() {
  return (
    <div className="h-[430px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <Canvas shadows camera={{ position: [14, 12, 14], fov: 45 }}>
        <Depot />
      </Canvas>
    </div>
  );
}
