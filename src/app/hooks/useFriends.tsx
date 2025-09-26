import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/supabaseClient";

export interface Friend {
  id: string;
  name: string;
  photo_url: string;
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("friends")
        .select("id, name, photo_url")
        .order("created_at", { ascending: true });

      if (error) console.error("Supabase error:", error);
      else setFriends(data || []);

      setLoading(false);
    };

    fetchFriends();
  }, []);

  return { friends, loading };
}
