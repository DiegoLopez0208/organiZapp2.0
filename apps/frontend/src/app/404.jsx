
export async function getStaticProps() {

    return {
      props: {
        message: "Página no encontrada",
      },
    };
  }
  
  export default function Custom404({ message }) {
    return <h1>{message}</h1>;
  }
  