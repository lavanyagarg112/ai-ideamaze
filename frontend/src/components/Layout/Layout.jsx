import classes from './Layout.module.css'


const Layout = (props) => {
return (
    <div>
        <div>
            <main className={classes.main}>
                {props.children} 
            </main>
        </div>
    
    </div>
)
}

export default Layout
  