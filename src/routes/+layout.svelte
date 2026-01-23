<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
</script>

<div class="min-h-screen flex flex-col bg-[radial-gradient(1200px_circle_at_20%_0%,theme(colors.whiskey.100),transparent_55%),radial-gradient(900px_circle_at_80%_10%,theme(colors.whiskey.50),transparent_50%),linear-gradient(to_bottom,theme(colors.gray.50),theme(colors.gray.50))]">
  <div class="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,black_1px,transparent_0)] [background-size:18px_18px]"></div>
  <Header />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
  <ToastContainer />
</div>
