// keep everything the same as your current file, just replace the two useEffect blocks with:

  useEffect(() => {
    let active = true

    const loadPurchases = async () => {
      try {
        const res = await fetch("/api/user-purchases", { cache: "no-store" })
        const data = await res.json()
        if (active) setPurchasedPrograms(data.purchasedExamIds || [])
      } catch (err) {
        console.error("Failed to fetch purchases", err)
      }
    }

    loadPurchases()
    const id = setInterval(loadPurchases, 30000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadCounts = async () => {
      try {
        const res = await fetch("/api/exam-packages/summary", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (active) setCountsMap(data || {})
      } catch {
        // no-op
      }
    }

    loadCounts()
    const id = setInterval(loadCounts, 30000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])
